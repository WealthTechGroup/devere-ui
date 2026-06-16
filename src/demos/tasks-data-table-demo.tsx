import type { ColumnDef } from "@tanstack/react-table";

import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilterProps,
} from "@/components/devere-ui/data-table";
import { Badge } from "@/components/ui/badge";

type Task = {
  id: string;
  label: string;
  priority: "low" | "medium" | "high";
  status: "backlog" | "canceled" | "done" | "in progress" | "todo";
  title: string;
};

const tasks: Task[] = [
  {
    id: "TASK-8782",
    title:
      "You can't compress the program without quantifying the open-source SSD pixel!",
    label: "Documentation",
    status: "in progress",
    priority: "medium",
  },
  {
    id: "TASK-7878",
    title:
      "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    label: "Documentation",
    status: "backlog",
    priority: "medium",
  },
  {
    id: "TASK-7839",
    title: "We need to bypass the neural TCP card!",
    label: "Bug",
    status: "todo",
    priority: "high",
  },
  {
    id: "TASK-5562",
    title:
      "The SAS interface is down, bypass the open-source pixel so we can back up the PNG bandwidth!",
    label: "Feature",
    status: "backlog",
    priority: "medium",
  },
  {
    id: "TASK-1280",
    title:
      "Use the digital TLS panel, then you can transmit the haptic system!",
    label: "Bug",
    status: "done",
    priority: "high",
  },
  {
    id: "TASK-1138",
    title:
      "Generating the driver won't do anything, we need to quantify the 1080p SMTP bandwidth!",
    label: "Feature",
    status: "in progress",
    priority: "medium",
  },
  {
    id: "TASK-7184",
    title: "We need to program the back-end THX pixel!",
    label: "Feature",
    status: "todo",
    priority: "low",
  },
  {
    id: "TASK-5160",
    title:
      "Calculating the bus won't do anything, we need to navigate the back-end JSON protocol!",
    label: "Documentation",
    status: "in progress",
    priority: "high",
  },
];

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
    filterFn: (row, id, value) =>
      (value as string[]).includes(row.getValue(id)),
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
    filterFn: (row, id, value) =>
      (value as string[]).includes(row.getValue(id)),
  },
];

const filters: DataTableFilterProps[] = [
  { column: "status", title: "Status", options: statusOptions },
  { column: "priority", title: "Priority", options: priorityOptions },
];

function TasksDataTableDemo() {
  return (
    <DataTable
      className="w-full"
      columns={columns}
      data={tasks}
      filters={filters}
      searchColumn="title"
    />
  );
}

export { TasksDataTableDemo };
