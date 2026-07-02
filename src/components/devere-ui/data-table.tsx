import { useNavigate, useRouter } from "@tanstack/react-router";
import type { Column, OnChangeFn, Table } from "@tanstack/react-table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  DownloadIcon,
  EyeOff,
  PlusCircle,
  Settings2,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { LinearProgress } from "@/components/devere-ui/linear-progress";
import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
  TruncatedCell,
} from "@/components/devere-ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 25;

const filterEntrySchema = z.object({
  id: z.string(),
  value: z.preprocess(
    (value) => (typeof value === "string" ? [value] : value),
    z.array(z.string())
  ),
});

function normalizeFilterValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter((entry) => entry.length > 0);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

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

/** URL-shaped search params. Everything is optional (defaults are omitted). */
export type DataTableSearch = z.infer<typeof dataTableSearchSchema>;

export const dataTableSearchParamsSchema = dataTableSearchSchema
  .omit({ page: true, per_page: true })
  .extend({
    page: z.coerce.number().int().min(1).catch(1),
    per_page: z.coerce.number().int().min(1).catch(DEFAULT_PAGE_SIZE),
  });

/** Search params with required `page` and `per_page` (callback + consumer state). */
export type DataTableSearchParams = z.infer<typeof dataTableSearchParamsSchema>;

export function parseSearchParams(
  input: unknown = {},
  defaultPageSize: number = DEFAULT_PAGE_SIZE
): DataTableSearchParams {
  return dataTableSearchParamsSchema.parse({
    per_page: defaultPageSize,
    ...(typeof input === "object" && input !== null ? input : {}),
  });
}

type DataTableState = {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  pagination: PaginationState;
  sorting: SortingState;
};

function isEmptyFilterValue(value: unknown): boolean {
  return normalizeFilterValue(value).every(
    (entry) => entry.trim().length === 0
  );
}

function searchToTableState(search: DataTableSearchParams): DataTableState {
  return {
    columnFilters: (search.filters ?? [])
      .filter((filter) => !isEmptyFilterValue(filter.value))
      .map((filter) => ({ id: filter.id, value: filter.value })),
    globalFilter: search.q ?? "",
    pagination: {
      pageIndex: Math.max(0, search.page - 1),
      pageSize: search.per_page,
    },
    sorting:
      search.sort_by && search.sort
        ? [{ id: search.sort_by, desc: search.sort === "desc" }]
        : [],
  };
}

function tableStateToSearchParams(
  state: DataTableState,
  defaultPageSize: number
): DataTableSearchParams {
  const filters = state.columnFilters
    .filter((columnFilter) => !isEmptyFilterValue(columnFilter.value))
    .map((columnFilter) => ({
      id: columnFilter.id,
      value: normalizeFilterValue(columnFilter.value).map((entry) =>
        entry.trim()
      ),
    }));

  const activeSort = state.sorting[0];
  const globalFilter = state.globalFilter.trim();

  let sort: DataTableSearchParams["sort"];
  if (activeSort) {
    sort = activeSort.desc ? "desc" : "asc";
  }

  return parseSearchParams(
    {
      page: state.pagination.pageIndex + 1,
      per_page: state.pagination.pageSize || defaultPageSize,
      sort,
      sort_by: activeSort?.id,
      q: globalFilter || undefined,
      filters: filters.length > 0 ? filters : undefined,
    },
    defaultPageSize
  );
}

/** Strips defaults and empty values so the URL only carries user changes. */
function searchParamsToUrl(
  search: DataTableSearchParams,
  defaultPageSize: number
): DataTableSearch {
  return dataTableSearchSchema.parse({
    ...search,
    page: search.page > 1 ? search.page : undefined,
    per_page: search.per_page === defaultPageSize ? undefined : search.per_page,
  });
}

/**
 * Bridges the table's search params to the URL. Reads the current params once
 * (for the table's initial state) and returns a `writeSearch` callback the
 * table calls whenever its state changes. The URL is write-only after mount;
 * the table stays the source of truth.
 */
function useUrlSearchSync(defaultPageSize: number) {
  const router = useRouter();
  const navigate = useNavigate();

  const [initialSearch] = useState(() =>
    parseSearchParams(router.state.location.search, defaultPageSize)
  );

  const writeSearch = useCallback(
    (search: DataTableSearchParams) => {
      navigate({
        replace: true,
        search: searchParamsToUrl(search, defaultPageSize) as never,
        to: router.state.location.pathname,
      });
    },
    [navigate, router, defaultPageSize]
  );

  return { initialSearch, writeSearch };
}

const CSV_NEEDS_QUOTE = /[",\n\r]/;

function escapeCsvCell(value: string): string {
  if (CSV_NEEDS_QUOTE.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function unknownToCsvString(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function exportData<TData>(table: Table<TData>, format: "csv"): void {
  if (format !== "csv") {
    return;
  }

  const columns = table.getAllLeafColumns().filter((col) => {
    if (!col.getIsVisible() || col.id === "select") {
      return false;
    }
    const def = col.columnDef;
    return (
      ("accessorFn" in def && def.accessorFn != null) ||
      ("accessorKey" in def && def.accessorKey != null)
    );
  });

  const headerLine = columns
    .map((col) => escapeCsvCell(getColumnLabel(col)))
    .join(",");

  const dataLines = table
    .getFilteredRowModel()
    .rows.map((row) =>
      columns
        .map((col) => escapeCsvCell(unknownToCsvString(row.getValue(col.id))))
        .join(",")
    );

  const csv = [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `export-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

function getColumnLabel<TData>(column: Column<TData, unknown>): string {
  const metaLabel = (column.columnDef.meta as { label?: unknown } | undefined)
    ?.label;
  if (typeof metaLabel === "string") {
    return metaLabel;
  }
  const header = column.columnDef.header;
  if (typeof header === "string") {
    return header;
  }
  if (typeof header === "function") {
    try {
      const rendered = header({
        column,
        header: undefined as never,
        table: undefined as never,
      });
      const title = (rendered as { props?: { title?: unknown } } | null)?.props
        ?.title;
      if (typeof title === "string") {
        return title;
      }
    } catch {
      // ignore and fall through
    }
  }
  return column.id;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              size="sm"
              variant="ghost"
            >
              <span>{title}</span>
              {
                {
                  desc: <ArrowDown />,
                  asc: <ArrowUp />,
                  none: <ChevronsUpDown />,
                }[column.getIsSorted() || "none"]
              }
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  showCount?: boolean;
  title?: string;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  showCount = true,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const filterValue = column?.getFilterValue() as string[] | undefined;
  const selectedValues = new Set(filterValue ?? []);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button className="h-8 border-dashed" size="sm" variant="outline">
            <PlusCircle />
            {title}
            {selectedValues?.size > 0 && (
              <>
                <Separator className="mx-2 h-full" orientation="vertical" />
                <Badge
                  className="rounded-sm px-1 font-normal lg:hidden"
                  variant="secondary"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden gap-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      className="rounded-full px-1 font-normal"
                      variant="secondary"
                    >
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          className="rounded-full px-1 font-normal"
                          key={option.value}
                          variant="secondary"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((option) => !!option.value && !!option.label)
                .map((option) => {
                  const isSelected = selectedValues.has(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        if (isSelected) {
                          selectedValues.delete(option.value);
                        } else {
                          selectedValues.add(option.value);
                        }
                        const filterValues = Array.from(selectedValues);
                        column?.setFilterValue(
                          filterValues.length ? filterValues : undefined
                        );
                      }}
                    >
                      <div
                        className={cn(
                          "flex size-4 items-center justify-center rounded-[4px] border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input [&_svg]:invisible"
                        )}
                      >
                        <Check className="size-3.5 text-primary-foreground" />
                      </div>
                      {option.icon && (
                        <option.icon className="size-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                      {showCount && facets?.get(option.value) && (
                        <span className="absolute right-2 flex size-4 items-center justify-center font-mono text-muted-foreground text-xs">
                          {facets.get(option.value)}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    className="justify-center text-center"
                    onSelect={() => column?.setFilterValue(undefined)}
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface DataTablePaginationProps<TData> {
  pageSizeOptions?: number[];
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [25, 50, 100, 200],
}: DataTablePaginationProps<TData>) {
  const pageRows = table.getRowModel().rows.length;
  const totalRows = table.options.manualPagination
    ? table.getRowCount()
    : table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center px-2">
      <div className="hidden flex-1 text-muted-foreground text-sm lg:block">
        Showing {pageRows} of {totalRows} row{totalRows === 1 ? "" : "s"}.
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-sm">Rows per page</p>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={`${table.getState().pagination.pageSize}`}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent className="min-w-[80px]" side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="justify-center font-medium text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="hidden size-8 lg:flex"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            className="size-8"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            className="size-8"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            className="hidden size-8 lg:flex"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface DataTableFilterProps {
  column: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  title: string;
}

interface DataTableToolbarProps<TData> {
  exportable?: boolean;
  filters?: DataTableFilterProps[];
  onResetFilters?: () => void;
  searchColumn?: string;
  searchVisibleColumns?: boolean;
  serverSide?: boolean;
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
  exportable = true,
  filters,
  onResetFilters,
  searchColumn,
  searchVisibleColumns,
  serverSide,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;
  const hasSearch = searchVisibleColumns || Boolean(searchColumn);

  let searchValue = "";
  if (searchVisibleColumns) {
    searchValue = (table.getState().globalFilter as string | undefined) ?? "";
  } else if (searchColumn) {
    const filterValue = table.getColumn(searchColumn)?.getFilterValue() as
      | string[]
      | undefined;
    searchValue = filterValue?.[0] ?? "";
  }

  return (
    <div className="flex flex-col justify-between gap-2 lg:flex-row">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {hasSearch && (
          <Input
            aria-label="Filter rows"
            className="h-8 w-[150px] lg:w-[250px]"
            id="data-table-search"
            onChange={(event) => {
              if (searchVisibleColumns) {
                table.setGlobalFilter(event.target.value);
                return;
              }
              if (searchColumn) {
                const query = event.target.value;
                table
                  .getColumn(searchColumn)
                  ?.setFilterValue(query ? [query] : undefined);
              }
            }}
            placeholder={"Filter"}
            value={searchValue}
          />
        )}
        {filters?.map((filter) => (
          <DataTableFacetedFilter
            column={table.getColumn(filter.column)}
            key={filter.title}
            options={filter.options}
            showCount={!serverSide}
            title={filter.title}
          />
        ))}
        {isFiltered && (
          <Button
            onClick={() => {
              if (onResetFilters) {
                onResetFilters();
                return;
              }

              table.setColumnFilters([]);
              table.setGlobalFilter("");
            }}
            size="sm"
            variant="ghost"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-end gap-2 lg:ml-auto">
        {exportable ? <DataTableExportButton table={table} /> : null}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

export function DataTableExportButton<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <Button
      onClick={() => exportData(table, "csv")}
      size="sm"
      variant="outline"
    >
      <DownloadIcon />
      Export
    </Button>
  );
}

export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="flex h-8" size="sm" variant="outline">
            <Settings2 />
            View
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => {
              const label = getColumnLabel(column);
              return (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  key={column.id}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getPinnedColumnStyle<TData, TValue>(
  column: Column<TData, TValue>
): React.CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) {
    return {};
  }
  return {
    left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
    maxWidth: column.getSize(),
    minWidth: column.getSize(),
    position: "sticky",
    width: column.getSize(),
  };
}

function getPinnedColumnClass<TData, TValue>(
  column: Column<TData, TValue>,
  isHeader = false
): string | undefined {
  if (!column.getIsPinned()) {
    return;
  }
  return cn(
    "relative",
    isHeader
      ? "z-40"
      : "z-20 bg-background transition-colors group-hover:bg-muted group-data-[state=selected]:bg-muted dark:group-hover:bg-card",
    column.getIsLastColumn("left") &&
      "after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border after:content-['']"
  );
}

interface DataTableProps<TData, TValue> {
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultPageSize?: number;
  exportable?: boolean;
  filters?: DataTableFilterProps[];
  frozenColumns?: string[];
  /**
   * Seeds the initial sorting, filters, search and pagination. Read once on
   * mount; the table owns the state afterwards.
   */
  initialSearch?: DataTableSearch;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  /**
   * Called whenever the table's search params change (and once on mount).
   * The table is the source of truth; pass a `setState` here to drive a
   * server-side query. `page` and `per_page` are always present.
   */
  onSearchParamsChange?: (search: DataTableSearchParams) => void;
  pageSizeOptions?: number[];
  /**
   * Total number of rows across all pages, used for the page count in
   * `serverSide` mode. Falls back to `data.length` when omitted.
   */
  rowCount?: number;
  searchColumn?: string;
  searchVisibleColumns?: boolean;
  /**
   * Paginate, sort and filter on the server. The table renders `data` as-is
   * (one page) instead of slicing client-side, and faceted filters hide their
   * (per-page, misleading) counts.
   */
  serverSide?: boolean;
  size?: "sm" | "md" | "lg";
  /**
   * Persist pagination, sorting, filters and search in the URL. Requires a
   * TanStack Router context. The value is read once and must not change at
   * runtime. The URL is read once on mount, then only written to.
   */
  syncWithUrl?: boolean;
}

function useTableSearchState({
  defaultPageSize,
  initialSearch,
  onSearchParamsChange,
}: {
  defaultPageSize: number;
  initialSearch?: DataTableSearch;
  onSearchParamsChange?: (search: DataTableSearchParams) => void;
}) {
  const [state, setState] = useState(() =>
    searchToTableState(parseSearchParams(initialSearch, defaultPageSize))
  );

  const searchParams = useMemo(
    () => tableStateToSearchParams(state, defaultPageSize),
    [state, defaultPageSize]
  );

  const onSearchParamsChangeRef = useRef(onSearchParamsChange);
  onSearchParamsChangeRef.current = onSearchParamsChange;
  useEffect(() => {
    onSearchParamsChangeRef.current?.(searchParams);
  }, [searchParams]);

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        sorting: functionalUpdate(updater, prev.sorting),
      })),
    []
  );
  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        pagination: functionalUpdate(updater, prev.pagination),
      })),
    []
  );
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        columnFilters: functionalUpdate(updater, prev.columnFilters),
        pagination: { ...prev.pagination, pageIndex: 0 },
      })),
    []
  );
  const onGlobalFilterChange: OnChangeFn<string> = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        globalFilter: functionalUpdate(updater, prev.globalFilter),
        pagination: { ...prev.pagination, pageIndex: 0 },
      })),
    []
  );
  const onResetFilters = useCallback(
    () =>
      setState((prev) => ({
        ...prev,
        columnFilters: [],
        globalFilter: "",
        pagination: { ...prev.pagination, pageIndex: 0 },
      })),
    []
  );

  return {
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,
    onResetFilters,
    onSortingChange,
    state,
  };
}

export type BuildColumnDefProps<TData> = {
  title: string;
} & ColumnDef<TData>;

export function buildColumnDef<TData>({
  title,
  ...props
}: BuildColumnDefProps<TData>): ColumnDef<TData> {
  return {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    cell: ({ getValue }) => <TruncatedCell render={getValue()} />,
    ...props,
  };
}

function DataTableImpl<TData, TValue>({
  columns,
  data,
  defaultPageSize,
  exportable,
  filters,
  searchColumn,
  searchVisibleColumns,
  className,
  initialSearch,
  isLoading,
  onRowClick,
  onSearchParamsChange,
  rowCount,
  serverSide,
  frozenColumns,
  pageSizeOptions,
  size = "md",
}: DataTableProps<TData, TValue>) {
  const resolvedDefaultPageSize =
    defaultPageSize ?? pageSizeOptions?.[0] ?? DEFAULT_PAGE_SIZE;
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const {
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,
    onResetFilters,
    onSortingChange,
    state,
  } = useTableSearchState({
    defaultPageSize: resolvedDefaultPageSize,
    initialSearch,
    onSearchParamsChange,
  });

  const isServerSide = serverSide ?? false;

  const table = useReactTable({
    data,
    columns,
    autoResetPageIndex: false,
    manualFiltering: isServerSide,
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    rowCount: isServerSide ? (rowCount ?? data.length) : undefined,
    defaultColumn: {
      filterFn: (row, columnId, filterValue) => {
        const values = normalizeFilterValue(filterValue);
        if (values.length === 0) {
          return true;
        }

        const cellValue = String(row.getValue(columnId) ?? "")
          .trim()
          .toLowerCase();

        if (values.length === 1) {
          return cellValue.includes(values[0].trim().toLowerCase());
        }

        return values.some((value) => value.trim().toLowerCase() === cellValue);
      },
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const query = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      if (!query) {
        return true;
      }
      return String(row.getValue(columnId) ?? "")
        .trim()
        .toLowerCase()
        .includes(query);
    },
    getColumnCanGlobalFilter: (column) =>
      column.getIsVisible() && typeof column.accessorFn !== "undefined",
    state: {
      sorting: state.sorting,
      columnVisibility,
      rowSelection,
      columnFilters: state.columnFilters,
      globalFilter: state.globalFilter,
      pagination: state.pagination,
      columnPinning: {
        left: frozenColumns ?? [],
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div
      className={cn(
        "flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4",
        className
      )}
    >
      <DataTableToolbar
        exportable={exportable}
        filters={filters}
        onResetFilters={onResetFilters}
        searchColumn={searchColumn}
        searchVisibleColumns={searchVisibleColumns}
        serverSide={serverSide}
        table={table}
      />

      <div className="relative min-h-0 min-w-0 max-w-full flex-1 overflow-auto rounded-3xl border">
        {isLoading && (
          <LinearProgress
            aria-label="Loading rows"
            className="absolute inset-x-0 top-10.25 z-30"
          />
        )}
        {!table.getRowModel().rows?.length && (
          <div
            className="absolute top-10.25 right-0 bottom-0 left-0 flex flex-1 flex-col items-center justify-center bg-muted"
            role="status"
          >
            <p className="text-center text-muted-foreground text-sm">
              {isLoading ? "Loading…" : "No results."}
            </p>
          </div>
        )}
        <TableComponent
          className={
            frozenColumns ? "border-separate border-spacing-0" : undefined
          }
          containerClassName="overflow-visible"
        >
          <TableHeader className="sticky top-0 before:z-21">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className={cn(
                      "sticky top-0 z-30",
                      size === "sm" && "h-10",
                      size === "md" && "h-11",
                      size === "lg" && "h-12",
                      getPinnedColumnClass(header.column, true)
                    )}
                    colSpan={header.colSpan}
                    key={header.id}
                    style={getPinnedColumnStyle(header.column)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className={cn(isLoading && "opacity-50 transition-opacity")}
          >
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={cn(
                    "group bg-background in-[tbody]:hover:bg-muted data-[state=selected]:bg-muted dark:in-[tbody]:hover:bg-card",
                    frozenColumns && "border-b-0"
                  )}
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={cn(
                        frozenColumns && "border-b",
                        getPinnedColumnClass(cell.column),
                        size === "sm" && "py-2",
                        size === "md" && "py-3",
                        size === "lg" && "py-4"
                      )}
                      key={cell.id}
                      style={getPinnedColumnStyle(cell.column)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow aria-hidden className="invisible h-24">
                <TableCell className="h-24" colSpan={columns.length} />
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>
      <DataTablePagination pageSizeOptions={pageSizeOptions} table={table} />
    </div>
  );
}

function UrlSyncedDataTable<TData, TValue>(
  props: DataTableProps<TData, TValue>
) {
  const { onSearchParamsChange } = props;
  const defaultPageSize =
    props.defaultPageSize ?? props.pageSizeOptions?.[0] ?? DEFAULT_PAGE_SIZE;
  const { initialSearch, writeSearch } = useUrlSearchSync(defaultPageSize);

  const handleSearchParamsChange = useCallback(
    (search: DataTableSearchParams) => {
      writeSearch(search);
      onSearchParamsChange?.(search);
    },
    [writeSearch, onSearchParamsChange]
  );

  return (
    <DataTableImpl
      {...props}
      initialSearch={initialSearch}
      onSearchParamsChange={handleSearchParamsChange}
    />
  );
}

/**
 * A TanStack Table wrapper with sorting, filtering, pagination, column
 * visibility and CSV export.
 *
 * The table owns its state. Observe it via `onSearchParamsChange` (also fired
 * once on mount) and seed it with `initialSearch`. Pass `syncWithUrl` to
 * persist state in the URL (requires a TanStack Router context): the URL is
 * read once on mount, then only written to.
 */
export function DataTable<TData, TValue>({
  syncWithUrl,
  ...props
}: DataTableProps<TData, TValue>) {
  if (syncWithUrl) {
    return <UrlSyncedDataTable {...props} />;
  }
  return <DataTableImpl {...props} />;
}
