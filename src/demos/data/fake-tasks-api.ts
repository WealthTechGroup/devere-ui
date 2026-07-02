import type { DataTableSearchParams } from "@/components/devere-ui/data-table";
import tasksData from "./tasks.json";

export type Task = {
  id: string;
  label: string;
  priority: "high" | "low" | "medium";
  status: "backlog" | "canceled" | "done" | "in progress" | "todo";
  title: string;
};

export type FetchTasksResult = {
  rows: Task[];
  total: number;
};

const tasks = tasksData as Task[];

const API_DELAY_MS = 1000;

function cellValue(task: Task, key: string): string {
  return String(task[key as keyof Task] ?? "").toLowerCase();
}

function matchesFilter(task: Task, id: string, value: string[]): boolean {
  const cell = cellValue(task, id);

  if (value.length === 0) {
    return true;
  }

  if (value.length === 1) {
    return cell.includes(value[0].trim().toLowerCase());
  }

  return value.some((option) => option.trim().toLowerCase() === cell);
}

function applyFilters(rows: Task[], search: DataTableSearchParams): Task[] {
  let result = rows;

  for (const filter of search.filters ?? []) {
    result = result.filter((task) =>
      matchesFilter(task, filter.id, filter.value)
    );
  }

  const query = search.q?.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (task) =>
        task.id.toLowerCase().includes(query) ||
        task.title.toLowerCase().includes(query)
    );
  }

  return result;
}

function applySorting(rows: Task[], search: DataTableSearchParams): Task[] {
  if (!(search.sort_by && search.sort)) {
    return rows;
  }
  const key = search.sort_by as keyof Task;
  const direction = search.sort === "desc" ? -1 : 1;
  return [...rows].sort(
    (a, b) => String(a[key]).localeCompare(String(b[key])) * direction
  );
}

/**
 * Simulates a paginated backend over the local dataset. Accepts the exact
 * `searchParams` emitted by the table's `onSearchParamsChange` and resolves
 * after a delay so the table's loading state is visible.
 */
export function fetchTasks(
  search: DataTableSearchParams
): Promise<FetchTasksResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = applySorting(applyFilters(tasks, search), search);
      const perPage = search.per_page;
      const page = search.page ?? 1;
      const start = (page - 1) * perPage;

      resolve({
        rows: filtered.slice(start, start + perPage),
        total: filtered.length,
      });
    }, API_DELAY_MS);
  });
}
