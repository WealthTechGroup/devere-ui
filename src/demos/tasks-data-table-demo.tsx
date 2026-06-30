import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilterProps,
} from "@/components/devere-ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useDataTableSearch } from "@/lib/data-table-url-state";
import { fetchTasks, type Task } from "./data/fake-tasks-api";

const DEFAULT_PAGE_SIZE = 10;

const statusOptions = [
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in progress" },
  { label: "Done", value: "done" },
  { label: "Canceled", value: "canceled" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground text-xs">
        {row.getValue("id")}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="flex max-w-[320px] flex-col gap-0.5">
        <span className="truncate font-medium">{row.original.title}</span>
        <span className="truncate text-muted-foreground text-xs">
          {row.original.label}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Task["status"];
      return <Badge variant="secondary">{status}</Badge>;
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority") as Task["priority"];
      return <Badge variant="outline">{priority}</Badge>;
    },
  },
];

const filters: DataTableFilterProps[] = [
  { column: "status", title: "Status", options: statusOptions },
  { column: "priority", title: "Priority", options: priorityOptions },
];

function TasksDataTableDemo() {
  const { searchParams } = useDataTableSearch({
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const [data, setData] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    fetchTasks(searchParams).then((result) => {
      if (!active) {
        return;
      }
      setData(result.rows);
      setTotal(result.total);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <DataTable
      className="w-full"
      columns={columns}
      data={data}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      filters={filters}
      isLoading={isLoading}
      pageSizeOptions={[10, 25, 50, 100]}
      rowCount={total}
      searchVisibleColumns
      serverSide
      syncWithUrl
    />
  );
}

export { TasksDataTableDemo };
