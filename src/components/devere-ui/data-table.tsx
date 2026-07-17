import { useLocation, useNavigate } from "@tanstack/react-router";
import type { Column, OnChangeFn, Row, Table } from "@tanstack/react-table";
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
  type RowSelectionState,
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
  Plus,
  PlusCircle,
  Settings2,
  X,
} from "lucide-react";
import type React from "react";
import type { ReactNode } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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

function defaultColumnFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
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
}

function globalColumnFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
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
}

function getTableMinWidth<TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
  fixedLayout?: boolean
): number | undefined {
  if (!fixedLayout) {
    return;
  }
  const total = columns.reduce((sum, column) => sum + (column.size ?? 0), 0);
  return total > 0 ? total : undefined;
}

function getStickyHeaderOffsetClass(size: "sm" | "md" | "lg"): string {
  if (size === "sm") {
    return "top-[41px]";
  }
  if (size === "lg") {
    return "top-[49px]";
  }
  return "top-[45px]";
}

function getDataTableHeadHeightClass(size: "sm" | "md" | "lg"): string {
  if (size === "sm") {
    return "h-[40px]";
  }
  if (size === "lg") {
    return "h-[48px]";
  }
  return "h-[44px]";
}

function getDataTableCellPaddingClass(size: "sm" | "md" | "lg"): string {
  if (size === "sm") {
    return "py-2";
  }
  if (size === "lg") {
    return "py-4";
  }
  return "py-3";
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    // pass
  }
}

export const dataTableSearchSchema = z.object({
  filters: z.preprocess(
    parseJson,
    z.array(filterEntrySchema).optional().catch(undefined)
  ),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  sort: z.enum(["asc", "desc"]).optional().catch(undefined),
  sort_by: z.string().optional().catch(undefined),
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
        ? [{ desc: search.sort === "desc", id: search.sort_by }]
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

  const [activeSort] = state.sorting;
  const globalFilter = state.globalFilter.trim();

  let sort: DataTableSearchParams["sort"];
  if (activeSort) {
    sort = activeSort.desc ? "desc" : "asc";
  }

  return parseSearchParams(
    {
      filters: filters.length > 0 ? filters : undefined,
      page: state.pagination.pageIndex + 1,
      per_page: state.pagination.pageSize || defaultPageSize,
      q: globalFilter || undefined,
      sort,
      sort_by: activeSort?.id,
    },
    defaultPageSize
  );
}

function areSearchParamsEqual(
  a: DataTableSearchParams,
  b: DataTableSearchParams
): boolean {
  return (
    a.page === b.page &&
    a.per_page === b.per_page &&
    a.sort === b.sort &&
    a.sort_by === b.sort_by &&
    a.q === b.q &&
    JSON.stringify(a.filters ?? []) === JSON.stringify(b.filters ?? [])
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
 * Read and write DataTable search params via the URL. Requires TanStack Router.
 * Use with `<DataTable syncWithUrl />` — URL changes update the table, and
 * table interactions update the URL.
 */
export function useUrlSearchParams(
  defaultPageSize: number = DEFAULT_PAGE_SIZE
): {
  searchParams: DataTableSearchParams;
  setSearchParams: (
    search:
      | DataTableSearchParams
      | ((previous: DataTableSearchParams) => DataTableSearchParams)
  ) => void;
} {
  const { location, searchParams } =
    useDataTableLocationSearch(defaultPageSize);
  const navigate = useNavigate();

  const setSearchParams = useCallback(
    (
      search:
        | DataTableSearchParams
        | ((previous: DataTableSearchParams) => DataTableSearchParams)
    ) => {
      const next = typeof search === "function" ? search(searchParams) : search;
      const normalized = parseSearchParams(next, defaultPageSize);

      navigate({
        replace: true,
        search: searchParamsToUrl(normalized, defaultPageSize) as never,
        to: location.pathname,
      });
    },
    [defaultPageSize, location.pathname, navigate, searchParams]
  );

  return { searchParams, setSearchParams };
}

function useDataTableLocationSearch(defaultPageSize: number) {
  const location = useLocation();

  const searchParams = useMemo(
    () => parseSearchParams(location.search, defaultPageSize),
    [defaultPageSize, location.search]
  );

  return { location, searchParams };
}

const CSV_NEEDS_QUOTE = /[",\n\r]/;

function escapeCsvCell(value: string): string {
  if (CSV_NEEDS_QUOTE.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function unknownToCsvString(value: unknown): string {
  if (value === null) {
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
      ("accessorFn" in def && def.accessorFn !== null) ||
      ("accessorKey" in def && def.accessorKey !== null)
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
  const { header } = column.columnDef;
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
    <div className={cn("flex items-center gap-2", className)} data-interactive>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              className="h-8 min-w-0 max-w-full data-[state=open]:bg-accent"
              size="sm"
              variant="ghost"
            >
              <span className="truncate">{title}</span>
              {
                {
                  asc: <ArrowUp />,
                  desc: <ArrowDown />,
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
  allowCustom?: boolean;
  column?: Column<TData, TValue>;
  customPlaceholder?: string;
  description?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  showCount?: boolean;
  title?: string;
}

function getFilterOptionLabel(
  value: string,
  options: DataTableFacetedFilterProps<unknown, unknown>["options"]
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

type FacetedFilterOption = DataTableFacetedFilterProps<
  unknown,
  unknown
>["options"][number];

function useFacetedFilterLogic<TData, TValue>({
  allowCustom,
  column,
  options,
  showCount = true,
}: Pick<
  DataTableFacetedFilterProps<TData, TValue>,
  "allowCustom" | "column" | "options" | "showCount"
>) {
  // Skip faceting when unused — filter-only columns without accessors crash
  // TanStack's getFacetedUniqueValues (values.length on undefined).
  const facets = showCount ? column?.getFacetedUniqueValues() : undefined;
  const filterValue = column?.getFilterValue() as string[] | undefined;
  const selectedValues = new Set(filterValue ?? []);
  const [customInput, setCustomInput] = useState("");

  const optionValues = new Set(options.map((option) => option.value));
  const customOptions: FacetedFilterOption[] = Array.from(selectedValues)
    .filter((value) => !optionValues.has(value))
    .map((value) => ({ label: value, value }));
  const displayOptions = [...options, ...customOptions];

  const setSelectedValues = (values: Set<string>) => {
    const filterValues = Array.from(values);
    column?.setFilterValue(filterValues.length ? filterValues : undefined);
  };

  const toggleValue = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setSelectedValues(next);
  };

  const selectCustomValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || selectedValues.has(trimmed)) {
      return;
    }
    const next = new Set(selectedValues);
    next.add(trimmed);
    setSelectedValues(next);
    setCustomInput("");
  };

  const clearFilters = () => column?.setFilterValue(undefined);

  const trimmedInput = customInput.trim();
  const pendingCustomValue = Boolean(
    allowCustom &&
      trimmedInput.length > 0 &&
      !selectedValues.has(trimmedInput) &&
      !options.some((option) => option.value === trimmedInput)
  );
  const showTypeToAddEmpty = Boolean(
    allowCustom &&
      !trimmedInput &&
      displayOptions.length === 0 &&
      !pendingCustomValue
  );
  const hasFilterItems = pendingCustomValue || displayOptions.length > 0;
  const showListSection = hasFilterItems || showTypeToAddEmpty;

  return {
    clearFilters,
    customInput,
    displayOptions,
    facets,
    hasFilterItems,
    pendingCustomValue,
    selectCustomValue,
    selectedValues,
    setCustomInput,
    showListSection,
    showTypeToAddEmpty,
    toggleValue,
    trimmedInput,
  };
}

function FacetedFilterSelectedBadges({
  options,
  selectedValues,
}: {
  options: FacetedFilterOption[];
  selectedValues: Set<string>;
}) {
  if (selectedValues.size === 0) {
    return null;
  }

  return (
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
          <Badge className="rounded-full px-1 font-normal" variant="secondary">
            {selectedValues.size} selected
          </Badge>
        ) : (
          Array.from(selectedValues).map((value) => (
            <Badge
              className="rounded-full px-1 font-normal"
              key={value}
              variant="secondary"
            >
              {getFilterOptionLabel(value, options)}
            </Badge>
          ))
        )}
      </div>
    </>
  );
}

function FacetedFilterCheckboxOption({
  facetCount,
  isSelected,
  onSelect,
  option,
  showCount,
}: {
  facetCount?: number;
  isSelected: boolean;
  onSelect: () => void;
  option: FacetedFilterOption;
  showCount: boolean;
}) {
  return (
    <CommandItem
      className={cn("[&>.lucide-check]:last:hidden")}
      onSelect={onSelect}
    >
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input [&_svg]:invisible"
        )}
      >
        <Check className="size-3.5 text-primary-foreground" />
      </div>
      {option.icon ? (
        <option.icon className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
      <span className="truncate">{option.label}</span>
      {showCount && facetCount ? (
        <span className="ml-auto flex size-4 shrink-0 items-center justify-center font-mono text-muted-foreground text-xs">
          {facetCount}
        </span>
      ) : null}
    </CommandItem>
  );
}

function FacetedFilterAddOption({
  onSelect,
  value,
}: {
  onSelect: () => void;
  value: string;
}) {
  return (
    <CommandItem onSelect={onSelect}>
      <div className="flex size-4 shrink-0 items-center justify-center">
        <Plus className="size-3.5 text-muted-foreground" />
      </div>
      <span className="truncate">{value}</span>
    </CommandItem>
  );
}

function FacetedFilterOptionsList({
  allowCustom,
  displayOptions,
  facetCounts,
  hasFilterItems,
  onSelectCustom,
  onToggleValue,
  pendingCustomValue,
  selectedValues,
  showCount,
  showTypeToAddEmpty,
  trimmedInput,
}: {
  allowCustom: boolean;
  displayOptions: FacetedFilterOption[];
  facetCounts?: Map<string, number>;
  hasFilterItems: boolean;
  onSelectCustom: (value: string) => void;
  onToggleValue: (value: string) => void;
  pendingCustomValue: boolean;
  selectedValues: Set<string>;
  showCount: boolean;
  showTypeToAddEmpty: boolean;
  trimmedInput: string;
}) {
  return (
    <>
      {allowCustom ? null : <CommandEmpty>No results found.</CommandEmpty>}
      {showTypeToAddEmpty ? (
        <CommandEmpty className="py-6 text-muted-foreground text-sm">
          Type to add a filter
        </CommandEmpty>
      ) : null}
      {hasFilterItems ? (
        <CommandGroup>
          {pendingCustomValue ? (
            <FacetedFilterAddOption
              onSelect={() => onSelectCustom(trimmedInput)}
              value={trimmedInput}
            />
          ) : null}
          {displayOptions
            .filter((option) => !!option.value && !!option.label)
            .map((option) => (
              <FacetedFilterCheckboxOption
                facetCount={facetCounts?.get(option.value)}
                isSelected={selectedValues.has(option.value)}
                key={option.value}
                onSelect={() => onToggleValue(option.value)}
                option={option}
                showCount={showCount}
              />
            ))}
        </CommandGroup>
      ) : null}
    </>
  );
}

function FacetedFilterClearSection({ onClear }: { onClear: () => void }) {
  return (
    <CommandGroup>
      <CommandItem className="justify-center gap-2" onSelect={onClear}>
        <X className="size-4 shrink-0" />
        Clear filters
      </CommandItem>
    </CommandGroup>
  );
}

function FacetedFilterCustomPopoverContent({
  clearFilters,
  customInput,
  customPlaceholder,
  description,
  filterOptionsList,
  onCustomInputChange,
  pendingCustomValue,
  selectCustomValue,
  selectedCount,
  showListSection,
  title,
  trimmedInput,
}: {
  clearFilters: () => void;
  customInput: string;
  customPlaceholder?: string;
  description?: string;
  filterOptionsList: React.ReactNode;
  onCustomInputChange: (value: string) => void;
  pendingCustomValue: boolean;
  selectCustomValue: (value: string) => void;
  selectedCount: number;
  showListSection: boolean;
  title?: string;
  trimmedInput: string;
}) {
  return (
    <>
      <Command
        className="rounded-none bg-transparent p-0 **:data-[slot=command-input-wrapper]:p-0"
        shouldFilter={false}
      >
        <div className="p-2">
          <CommandInput
            onKeyDown={(event) => {
              if (event.key === "Enter" && pendingCustomValue) {
                event.preventDefault();
                selectCustomValue(trimmedInput);
              }
            }}
            onValueChange={onCustomInputChange}
            placeholder={
              customPlaceholder ??
              `Search ${title?.toLowerCase() ?? "filters"}…`
            }
            value={customInput}
          />
        </div>
        {showListSection ? <Separator /> : null}
        <CommandList className="max-h-72 overflow-y-auto p-0">
          {filterOptionsList}
        </CommandList>
        {selectedCount > 0 ? (
          <>
            <Separator />
            <FacetedFilterClearSection onClear={clearFilters} />
          </>
        ) : null}
      </Command>
      {description ? (
        <>
          <Separator />
          <p className="px-2 py-2 text-muted-foreground text-xs">
            {description}
          </p>
        </>
      ) : null}
    </>
  );
}

function FacetedFilterDefaultPopoverContent({
  optionList,
  title,
}: {
  optionList: React.ReactNode;
  title?: string;
}) {
  return (
    <Command className="rounded-none bg-transparent p-0 **:data-[slot=command-input-wrapper]:p-0">
      <div className="p-2">
        <CommandInput placeholder={title} />
      </div>
      <Separator />
      <CommandList className="max-h-72 overflow-y-auto p-0">
        {optionList}
      </CommandList>
    </Command>
  );
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  showCount = true,
  allowCustom = false,
  customPlaceholder,
  description,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const filter = useFacetedFilterLogic({
    allowCustom,
    column,
    options,
    showCount,
  });

  const filterOptionsList = (
    <FacetedFilterOptionsList
      allowCustom={allowCustom}
      displayOptions={filter.displayOptions}
      facetCounts={filter.facets}
      hasFilterItems={filter.hasFilterItems}
      onSelectCustom={filter.selectCustomValue}
      onToggleValue={filter.toggleValue}
      pendingCustomValue={filter.pendingCustomValue}
      selectedValues={filter.selectedValues}
      showCount={showCount}
      showTypeToAddEmpty={filter.showTypeToAddEmpty}
      trimmedInput={filter.trimmedInput}
    />
  );

  const optionList = (
    <>
      {filterOptionsList}
      {!allowCustom && filter.selectedValues.size > 0 ? (
        <>
          <CommandSeparator className="my-0" />
          <FacetedFilterClearSection onClear={filter.clearFilters} />
        </>
      ) : null}
    </>
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button className="h-8 border-dashed" size="sm" variant="outline">
            <PlusCircle />
            {title}
            <FacetedFilterSelectedBadges
              options={options}
              selectedValues={filter.selectedValues}
            />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-[260px] gap-0 p-0">
        {allowCustom ? (
          <FacetedFilterCustomPopoverContent
            clearFilters={filter.clearFilters}
            customInput={filter.customInput}
            customPlaceholder={customPlaceholder}
            description={description}
            filterOptionsList={filterOptionsList}
            onCustomInputChange={filter.setCustomInput}
            pendingCustomValue={filter.pendingCustomValue}
            selectCustomValue={filter.selectCustomValue}
            selectedCount={filter.selectedValues.size}
            showListSection={filter.showListSection}
            title={title}
            trimmedInput={filter.trimmedInput}
          />
        ) : (
          <FacetedFilterDefaultPopoverContent
            optionList={optionList}
            title={title}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

interface DataTablePaginationProps<TData> {
  pageSizeOptions?: number[];
  table: Table<TData>;
}

const pageNumberFormatter = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

function getPaginationCounts<TData>(table: Table<TData>) {
  const pageRows = pageNumberFormatter.format(table.getRowModel().rows.length);
  const totalRows = pageNumberFormatter.format(
    table.options.manualPagination
      ? table.getRowCount()
      : table.getFilteredRowModel().rows.length
  );
  const pageCount = pageNumberFormatter.format(table.getPageCount());
  const page = pageNumberFormatter.format(
    table.getState().pagination.pageIndex + 1
  );

  return { page, pageCount, pageRows, totalRows };
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [25, 50, 100, 200],
  selectionLabel = true,
}: DataTablePaginationProps<TData> & { selectionLabel?: boolean }) {
  const { pageRows, totalRows, pageCount, page } = getPaginationCounts(table);
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="flex items-center px-2">
      <div className="hidden flex-1 text-muted-foreground text-sm lg:block">
        {selectionLabel && selectedCount > 0
          ? `${selectedCount} selected`
          : `Showing ${pageRows} of ${totalRows} row${totalRows === "1" ? "" : "s"}.`}
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
          Page {page} of {pageCount}
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
  allowCustom?: boolean;
  column: string;
  customPlaceholder?: string;
  description?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  showCount?: boolean;
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
  toolbarActions?: ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  exportable = true,
  filters,
  onResetFilters,
  searchColumn,
  searchVisibleColumns,
  serverSide,
  toolbarActions,
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
        {hasSearch ? (
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
        ) : null}
        {filters?.map((filter) => (
          <DataTableFacetedFilter
            allowCustom={filter.allowCustom}
            column={table.getColumn(filter.column)}
            customPlaceholder={filter.customPlaceholder}
            description={filter.description}
            key={filter.title}
            options={filter.options}
            showCount={filter.showCount ?? !serverSide}
            title={filter.title}
          />
        ))}
        {isFiltered ? (
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
        ) : null}
        {toolbarActions}
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

function getColumnStyle<TData, TValue>(
  column: Column<TData, TValue>,
  fixedLayout?: boolean
): React.CSSProperties {
  const pinned = column.getIsPinned();
  const { size } = column.columnDef;
  const hasFixedSize = size !== undefined;

  if (!fixedLayout) {
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

  if (!(hasFixedSize || pinned)) {
    return {};
  }

  const widthStyle: React.CSSProperties = hasFixedSize
    ? { minWidth: size }
    : {
        maxWidth: column.getSize(),
        minWidth: column.getSize(),
        width: column.getSize(),
      };

  if (!pinned) {
    return widthStyle;
  }

  return {
    ...widthStyle,
    left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
    position: "sticky",
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
      ? "z-30"
      : "z-20 bg-background transition-colors group-hover:bg-muted group-data-[state=selected]:bg-accent! dark:group-data-[state=selected]:bg-muted! dark:group-hover:bg-card",
    column.getIsLastColumn("left") &&
      "after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border after:content-['']"
  );
}

interface DataTableProps<TData, TValue> {
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultPageSize?: number;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  exportable?: boolean;
  filters?: DataTableFilterProps[];
  /** Use table-layout: fixed and honour column `size` defs for min widths. */
  fixedLayout?: boolean;
  frozenColumns?: string[];
  getRowId?: (originalRow: TData, index: number) => string;
  /** Column ids hidden from the table UI (e.g. filter-only columns). */
  hiddenColumns?: string[];
  /**
   * Seeds the initial sorting, filters, search and pagination. Read once on
   * mount; the table owns the state afterwards.
   */
  initialSearch?: DataTableSearch;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
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
  rowSelection?: RowSelectionState;
  searchColumn?: string;
  searchVisibleColumns?: boolean;
  /** Show "N selected" in the pagination footer when any rows are selected. */
  selectionLabel?: boolean;
  /**
   * Paginate, sort and filter on the server. The table renders `data` as-is
   * (one page) instead of slicing client-side, and faceted filters hide their
   * (per-page, misleading) counts.
   */
  serverSide?: boolean;
  size?: "sm" | "md" | "lg";
  /**
   * Persist pagination, sorting, filters and search in the URL. Requires a
   * TanStack Router context. URL changes (back/forward or `useUrlSearchParams`)
   * update the table; table interactions update the URL.
   */
  syncWithUrl?: boolean;
  /** Rendered after filters in the left toolbar cluster. */
  toolbarActions?: ReactNode;
}

type DataTableImplProps<TData, TValue> = DataTableProps<TData, TValue> & {
  urlSearch?: DataTableSearchParams;
};

function useTableSearchState({
  defaultPageSize,
  initialSearch,
  urlSearch,
  onSearchParamsChange,
}: {
  defaultPageSize: number;
  initialSearch?: DataTableSearch;
  urlSearch?: DataTableSearchParams;
  onSearchParamsChange?: (search: DataTableSearchParams) => void;
}) {
  const [state, setState] = useState(() =>
    searchToTableState(
      parseSearchParams(urlSearch ?? initialSearch, defaultPageSize)
    )
  );

  useEffect(() => {
    if (urlSearch === undefined) {
      return;
    }

    setState((previous) => {
      const current = tableStateToSearchParams(previous, defaultPageSize);
      if (areSearchParamsEqual(current, urlSearch)) {
        return previous;
      }
      return searchToTableState(parseSearchParams(urlSearch, defaultPageSize));
    });
  }, [defaultPageSize, urlSearch]);

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
        pagination: { ...prev.pagination, pageIndex: 0 },
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
    cell: ({ getValue }) => <TruncatedCell render={getValue()} />,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    ...props,
  };
}

export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => {
      const allSelected = table.getIsAllPageRowsSelected();
      const someSelected = table.getIsSomePageRowsSelected();
      const indeterminate = someSelected && !allSelected;

      return (
        <Checkbox
          aria-label="Select all"
          checked={allSelected}
          indeterminate={indeterminate}
          onCheckedChange={(checked) => {
            if (indeterminate || allSelected) {
              table.toggleAllPageRowsSelected(false);
              return;
            }
            table.toggleAllPageRowsSelected(checked);
          }}
        />
      );
    },
    id: "select",
    size: 36,
  };
}

function DataTableImpl<TData, TValue>({
  columns,
  data,
  defaultPageSize,
  enableRowSelection = true,
  exportable,
  filters,
  getRowId,
  searchColumn,
  searchVisibleColumns,
  className,
  initialSearch,
  isLoading,
  onRowClick,
  onRowSelectionChange: onRowSelectionChangeProp,
  onSearchParamsChange,
  rowCount,
  rowSelection: rowSelectionProp,
  selectionLabel = true,
  serverSide,
  frozenColumns,
  pageSizeOptions,
  fixedLayout,
  hiddenColumns,
  size = "md",
  toolbarActions,
  urlSearch,
}: DataTableImplProps<TData, TValue>) {
  const resolvedDefaultPageSize = defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const [uncontrolledSelection, setUncontrolledSelection] =
    useState<RowSelectionState>({});
  const rowSelection = rowSelectionProp ?? uncontrolledSelection;
  const onRowSelectionChange =
    onRowSelectionChangeProp ?? setUncontrolledSelection;
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () =>
      Object.fromEntries(
        (hiddenColumns ?? []).map((columnId) => [columnId, false])
      )
  );
  const {
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,
    onResetFilters,
    onSortingChange,
    state,
  } = useTableSearchState({
    defaultPageSize: resolvedDefaultPageSize,
    initialSearch: urlSearch ? undefined : initialSearch,
    onSearchParamsChange,
    urlSearch,
  });

  const isServerSide = serverSide ?? false;
  const tableMinWidth = useMemo(() => {
    if (!fixedLayout) {
      return;
    }
    const hidden = new Set(hiddenColumns ?? []);
    const visibleColumns = columns.filter((column) => {
      const id =
        ("id" in column && column.id) ||
        ("accessorKey" in column ? String(column.accessorKey) : undefined);
      return !(id && hidden.has(id));
    });
    return getTableMinWidth(visibleColumns, fixedLayout);
  }, [columns, fixedLayout, hiddenColumns]);

  const table = useReactTable({
    autoResetPageIndex: false,
    columns,
    data,
    defaultColumn: {
      filterFn: defaultColumnFilterFn,
    },
    enableRowSelection,
    getColumnCanGlobalFilter: (column) =>
      column.getIsVisible() && typeof column.accessorFn !== "undefined",
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: globalColumnFilterFn,
    manualFiltering: isServerSide,
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange,
    onPaginationChange,
    onRowSelectionChange,
    onSortingChange,
    rowCount: isServerSide ? (rowCount ?? data.length) : undefined,
    state: {
      columnFilters: state.columnFilters,
      columnPinning: {
        left: frozenColumns ?? [],
      },
      columnVisibility,
      globalFilter: state.globalFilter,
      pagination: state.pagination,
      rowSelection,
      sorting: state.sorting,
    },
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
        toolbarActions={toolbarActions}
      />

      <div className="relative min-h-0 min-w-0 max-w-full flex-1 overflow-auto rounded-3xl border">
        {isLoading ? (
          <div
            className={cn(
              "pointer-events-none sticky z-31 h-0 overflow-visible",
              getStickyHeaderOffsetClass(size)
            )}
          >
            <LinearProgress
              aria-label="Loading rows"
              className="absolute inset-x-0 top-0"
            />
          </div>
        ) : null}
        {!table.getRowModel().rows?.length && (
          <div
            className={cn(
              "absolute right-0 bottom-0 left-0 flex flex-1 flex-col items-center justify-center bg-muted",
              getStickyHeaderOffsetClass(size)
            )}
            role="status"
          >
            <p className="text-center text-muted-foreground text-sm">
              {isLoading ? "Loading…" : "No results."}
            </p>
          </div>
        )}
        <TableComponent
          className={cn(
            fixedLayout && tableMinWidth && "table-fixed",
            frozenColumns && "border-separate border-spacing-0"
          )}
          containerClassName="overflow-visible"
          style={
            fixedLayout && tableMinWidth
              ? { minWidth: tableMinWidth }
              : undefined
          }
        >
          {fixedLayout && tableMinWidth ? (
            <colgroup>
              {table.getVisibleLeafColumns().map((column) => (
                <col
                  key={column.id}
                  style={
                    column.columnDef.size === undefined
                      ? undefined
                      : { width: column.columnDef.size }
                  }
                />
              ))}
            </colgroup>
          ) : null}
          <TableHeader className="sticky top-0 z-30 before:z-21">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className={cn(
                      "sticky top-0 z-30 has-data-interactive:pl-0",
                      getDataTableHeadHeightClass(size),
                      getPinnedColumnClass(header.column, true)
                    )}
                    colSpan={header.colSpan}
                    key={header.id}
                    style={getColumnStyle(header.column, fixedLayout)}
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
                    "group bg-background in-[tbody]:hover:bg-muted data-[state=selected]:bg-accent! dark:data-[state=selected]:bg-muted! dark:in-[tbody]:hover:bg-card",
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
                        getDataTableCellPaddingClass(size)
                      )}
                      key={cell.id}
                      style={getColumnStyle(cell.column, fixedLayout)}
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
                <TableCell
                  className="h-24"
                  colSpan={table.getVisibleLeafColumns().length}
                />
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>
      <DataTablePagination
        pageSizeOptions={pageSizeOptions}
        selectionLabel={selectionLabel}
        table={table}
      />
    </div>
  );
}

function UrlSyncedDataTable<TData, TValue>(
  props: DataTableProps<TData, TValue>
) {
  const { onSearchParamsChange } = props;
  const defaultPageSize = props.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const { location, searchParams: urlSearch } =
    useDataTableLocationSearch(defaultPageSize);
  const navigate = useNavigate();

  const writeSearch = useCallback(
    (search: DataTableSearchParams) => {
      navigate({
        replace: true,
        search: searchParamsToUrl(search, defaultPageSize) as never,
        to: location.pathname,
      });
    },
    [defaultPageSize, location.pathname, navigate]
  );

  const handleSearchParamsChange = useCallback(
    (search: DataTableSearchParams) => {
      if (!areSearchParamsEqual(search, urlSearch)) {
        writeSearch(search);
      }
      onSearchParamsChange?.(search);
    },
    [onSearchParamsChange, urlSearch, writeSearch]
  );

  return (
    <DataTableImpl
      {...props}
      onSearchParamsChange={handleSearchParamsChange}
      urlSearch={urlSearch}
    />
  );
}

/**
 * A TanStack Table wrapper with sorting, filtering, pagination, column
 * visibility and CSV export.
 *
 * The table owns its state. Observe it via `onSearchParamsChange` (also fired
 * once on mount) and seed it with `initialSearch`. Pass `syncWithUrl` to
 * persist state in the URL (requires TanStack Router). Use `useUrlSearchParams`
 * to read or set search params from outside — URL changes update the table.
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
