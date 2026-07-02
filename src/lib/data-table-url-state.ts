import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { functionalUpdate } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo } from "react";
import { z } from "zod";

const DEFAULT_PAGE_SIZE = 10;

const filterEntrySchema = z.object({
  id: z.string(),
  value: z.unknown(),
});

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return;
  }
}

export const dataTableSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort: z.enum(["asc", "desc"]).optional().catch(undefined),
  sort_by: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  filters: z.preprocess(
    parseJson,
    z.array(filterEntrySchema).optional().catch(undefined)
  ),
});

export type DataTableSearch = z.infer<typeof dataTableSearchSchema>;

export type UseDataTableSearchOptions = {
  defaultPageSize?: number;
};

type DataTableSearchState = {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  pagination: PaginationState;
  sorting: SortingState;
};

function isEmptyFilterValue(value: unknown): boolean {
  if (value == null || value === "") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

function searchToTableState(
  search: DataTableSearch,
  defaultPageSize: number
): DataTableSearchState {
  return {
    columnFilters: (search.filters ?? [])
      .filter((filter) => !isEmptyFilterValue(filter.value))
      .map((filter) => ({ id: filter.id, value: filter.value })),
    globalFilter: search.q ?? "",
    pagination: {
      pageIndex: Math.max(0, (search.page ?? 1) - 1),
      pageSize: search.per_page ?? defaultPageSize,
    },
    sorting:
      search.sort_by && search.sort
        ? [{ id: search.sort_by, desc: search.sort === "desc" }]
        : [],
  };
}

function tableStateToSearch(
  state: DataTableSearchState,
  defaultPageSize: number
): DataTableSearch {
  const filters = state.columnFilters
    .filter((columnFilter) => !isEmptyFilterValue(columnFilter.value))
    .map((columnFilter) => ({
      id: columnFilter.id,
      value: columnFilter.value,
    }));

  const activeSort = state.sorting[0];
  const globalFilter = state.globalFilter.trim();

  let sort: DataTableSearch["sort"];
  if (activeSort) {
    sort = activeSort.desc ? "desc" : "asc";
  }

  return {
    page:
      state.pagination.pageIndex > 0
        ? state.pagination.pageIndex + 1
        : undefined,
    per_page: state.pagination.pageSize || defaultPageSize,
    sort,
    sort_by: activeSort?.id,
    q: globalFilter || undefined,
    filters: filters.length > 0 ? filters : undefined,
  };
}

function compactSearch(search: DataTableSearch): DataTableSearch {
  const compact: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined) {
      compact[key] = value;
    }
  }
  return compact as DataTableSearch;
}

/**
 * Reads and writes TanStack Table state to the URL search params.
 *
 * `DataTable` calls this internally when `syncWithUrl` is set, so you usually
 * do not need it. Call it directly only when a parent needs to read the
 * current table state (e.g. to drive a server-side query):
 *
 * ```tsx
 * const { searchParams, globalFilter, columnFilters } = useDataTableSearch();
 * ```
 */
export function useDataTableSearch(options: UseDataTableSearchOptions = {}) {
  const ownsPageSize = options.defaultPageSize != null;
  const defaultPageSize = options.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const router = useRouter();
  const navigate = useNavigate();
  const rawSearch = useRouterState({
    select: (state) => state.location.search,
  });

  const parsedSearch = useMemo(
    () => dataTableSearchSchema.parse(rawSearch),
    [rawSearch]
  );

  const tableState = useMemo(
    () => searchToTableState(parsedSearch, defaultPageSize),
    [defaultPageSize, parsedSearch]
  );

  const updateTableState = useCallback(
    (getNext: (current: DataTableSearchState) => DataTableSearchState) => {
      const current = searchToTableState(
        dataTableSearchSchema.parse(router.state.location.search),
        defaultPageSize
      );
      const nextSearch = compactSearch(
        tableStateToSearch(getNext(current), defaultPageSize)
      );
      navigate({
        replace: true,
        search: nextSearch as never,
        to: router.state.location.pathname,
      });
    },
    [defaultPageSize, navigate, router]
  );

  // When the caller owns the page size (i.e. the DataTable passes an explicit
  // `defaultPageSize`), write it into the URL if it isn't there yet so other
  // readers of this hook stay in sync without knowing the default themselves.
  useEffect(() => {
    if (!ownsPageSize || parsedSearch.per_page != null) {
      return;
    }
    updateTableState((current) => ({
      ...current,
      pagination: { ...current.pagination, pageSize: defaultPageSize },
    }));
  }, [defaultPageSize, ownsPageSize, parsedSearch.per_page, updateTableState]);

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      updateTableState((current) => ({
        ...current,
        pagination: functionalUpdate(updater, current.pagination),
      }));
    },
    [updateTableState]
  );

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      updateTableState((current) => ({
        ...current,
        sorting: functionalUpdate(updater, current.sorting),
      }));
    },
    [updateTableState]
  );

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      updateTableState((current) => ({
        ...current,
        columnFilters: functionalUpdate(updater, current.columnFilters),
        pagination: { ...current.pagination, pageIndex: 0 },
      }));
    },
    [updateTableState]
  );

  const onGlobalFilterChange: OnChangeFn<string> = useCallback(
    (updater) => {
      updateTableState((current) => ({
        ...current,
        globalFilter: functionalUpdate(updater, current.globalFilter),
        pagination: { ...current.pagination, pageIndex: 0 },
      }));
    },
    [updateTableState]
  );

  const onResetFilters = useCallback(() => {
    updateTableState((current) => ({
      ...current,
      columnFilters: [],
      globalFilter: "",
      pagination: { ...current.pagination, pageIndex: 0 },
    }));
  }, [updateTableState]);

  const searchParams = useMemo(
    () => tableStateToSearch(tableState, defaultPageSize),
    [defaultPageSize, tableState]
  );

  return {
    columnFilters: tableState.columnFilters,
    globalFilter: tableState.globalFilter,
    onPaginationChange,
    onResetFilters,
    pagination: tableState.pagination,
    searchParams,
    setColumnFilters: onColumnFiltersChange,
    setGlobalFilter: onGlobalFilterChange,
    setSorting: onSortingChange,
    sorting: tableState.sorting,
  };
}
