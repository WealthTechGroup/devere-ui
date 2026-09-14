import type React from "react";
import { isValidElement } from "react";

import { cn } from "@/lib/utils";

interface TableProps extends React.ComponentProps<"table"> {
  containerClassName?: string;
}

function Table({ className, containerClassName, ...props }: TableProps) {
  return (
    <div
      className={cn("relative w-full overflow-x-auto", containerClassName)}
      data-slot="table-container"
    >
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        data-slot="table"
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn(
        "relative bg-muted before:absolute before:right-0 before:-bottom-px before:left-0 before:h-px before:bg-border dark:bg-card [&_tr]:border-0",
        className
      )}
      data-slot="table-header"
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      data-slot="table-body"
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn(
        "bg-sidebar font-medium before:absolute before:-top-px before:right-0 before:left-0 before:h-px before:bg-border dark:bg-card [&>tr]:last:border-b-0 [&>tr]:last:[&_td]:border-b-0",
        className
      )}
      data-slot="table-footer"
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b transition-colors in-[tbody]:hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      data-slot="table-row"
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 min-w-0 overflow-hidden whitespace-nowrap bg-muted px-3 text-left align-middle font-medium text-foreground has-[[role=checkbox]]:pr-0 dark:bg-card",
        className
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "min-w-0 overflow-hidden whitespace-nowrap px-3 py-2 align-middle has-[[role=checkbox]]:pr-0",
        className
      )}
      data-slot="table-cell"
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      className={cn("mt-4 text-muted-foreground text-sm", className)}
      data-slot="table-caption"
      {...props}
    />
  );
}

function TruncatedCell({
  render,
  className,
  ...props
}: {
  render: unknown;
  className?: string;
} & React.ComponentProps<"div">) {
  const text =
    typeof render === "string" || typeof render === "number"
      ? String(render)
      : null;

  const content = (() => {
    if (isValidElement(render)) {
      return render;
    }
    if (text === null) {
      return <span className="text-muted-foreground italic">No data</span>;
    }
    return text;
  })();

  return (
    <div
      className={cn("truncate", className)}
      title={text ?? undefined}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TruncatedCell,
};
