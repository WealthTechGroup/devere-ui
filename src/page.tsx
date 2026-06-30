import type { ReactNode } from "react";

import { CopyButton } from "@/components/copy-button";
import { DemoFrame } from "@/components/demo-frame";
import { Button } from "@/components/devere-ui/button";
import { ThemeToggle } from "@/components/devere-ui/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonDemo } from "@/demos/button-demo";
import { DashboardDemo } from "@/demos/dashboard-demo";
import { DialogDemo } from "@/demos/dialog-demo";
import { DrawerDemo } from "@/demos/drawer-demo";
import { FormattersDemo } from "@/demos/formatters-demo";
import { LoadingScreenDemo } from "@/demos/loading-screen-demo";
import { MicrosoftLoginDemo } from "@/demos/microsoft-login-demo";
import { NotFoundDemo } from "@/demos/not-found-demo";
import { TableDemo } from "@/demos/table-demo";
import { TabsDemo } from "@/demos/tabs-demo";
import { TasksDataTableDemo } from "@/demos/tasks-data-table-demo";
import { ThemeToggleDemo } from "@/demos/theme-toggle-demo";
import { cn } from "@/lib/utils";

const NAMESPACE_SETUP =
  "npx shadcn@latest registry add '@devere-ui=https://wealthtechgroup.github.io/devere-ui/r/{name}.json'";

interface RegistryItem {
  demo: ReactNode;
  description: string;
  expandable?: boolean;
  name: string;
  previewClassName?: string;
  title: string;
}

const items: RegistryItem[] = [
  {
    name: "button",
    title: "Button",
    description:
      "A button built on the shadcn button that adds a loading state with a spinner and optional loading text.",
    demo: <ButtonDemo />,
  },
  {
    name: "loading-screen",
    title: "Loading Screen",
    description:
      "A full-area loading state with a spinning ring and optional centered logo.",
    demo: <LoadingScreenDemo />,
  },
  {
    name: "theme-toggle",
    title: "Theme Toggle",
    description:
      "A dropdown to switch between light, dark and system theme. Wrap your app in ThemeProvider (included on install).",
    demo: <ThemeToggleDemo />,
  },
  {
    name: "tabs",
    title: "Tabs",
    description:
      "Tabs with default and line variants, horizontal and vertical orientation and an animated sliding indicator.",
    demo: <TabsDemo />,
    expandable: true,
    previewClassName: "items-start justify-start overflow-auto",
  },
  {
    name: "dialog",
    title: "Dialog",
    description:
      "A modal dialog with overlay, header, scrollable body, footer and an optional close button.",
    demo: <DialogDemo />,
  },
  {
    name: "drawer",
    title: "Drawer",
    description:
      "A swipeable drawer built on Base UI with overlay, handle, header, footer and directional placement.",
    demo: <DrawerDemo />,
  },
  {
    name: "not-found",
    title: "Not Found",
    description: "A centered 404 page with icon, title and description.",
    demo: <NotFoundDemo />,
  },
  {
    name: "table",
    title: "Table",
    description:
      "A styled table with header, body, footer and a truncated cell helper.",
    demo: <TableDemo />,
    previewClassName: "items-start justify-start",
  },
  {
    name: "data-table",
    title: "Data Table",
    description:
      "A TanStack Table wrapper with sorting, filters, pagination and column visibility. Tasks example inspired by shadcn.",
    demo: <TasksDataTableDemo />,
    expandable: true,
    previewClassName: "items-start justify-start overflow-auto",
  },
  {
    name: "formatters",
    title: "Formatters",
    description:
      "Currency, number and string formatters using Intl with compact notation and currency display helpers.",
    demo: <FormattersDemo />,
    previewClassName: "items-start justify-start",
  },
  {
    name: "dashboard",
    title: "Dashboard",
    description: "A dashboard with a sidebar and a main content area.",
    demo: <DashboardDemo />,
    previewClassName: "px-0 -my-(--card-spacing)",
  },
  {
    name: "microsoft-login",
    title: "Microsoft Login",
    description:
      "A centered sign-in page with a Microsoft SSO button, title, description and admin contact note.",
    demo: <MicrosoftLoginDemo />,
    previewClassName: "px-0 -my-(--card-spacing)",
  },
];

function CommandRow({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  return (
    <Card
      className={cn("flex-row items-center gap-2 py-1 pr-1 pl-3", className)}
      size="sm"
    >
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-muted-foreground text-xs">
        {command}
      </code>
      <CopyButton value={command} />
    </Card>
  );
}

function RegistryCard({ item }: { item: RegistryItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <DemoFrame
          className={item.previewClassName}
          expandable={item.expandable}
        >
          {item.demo}
        </DemoFrame>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 border-t">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Install
        </span>
        <CommandRow
          className="bg-muted/40 shadow-none ring-0"
          command={`npx shadcn@latest add @devere-ui/${item.name}`}
        />
      </CardFooter>
    </Card>
  );
}

export function App() {
  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-2xl tracking-tight">deVere UI</h1>
          <ThemeToggle className="ml-auto" size="icon-sm" variant="outline" />
          <Button
            onClick={() =>
              window.open(
                "https://github.com/WealthTechGroup/devere-ui",
                "_blank"
              )
            }
            size="sm"
            variant="outline"
          >
            GitHub
          </Button>
        </div>
        <p className="max-w-prose text-muted-foreground text-sm leading-relaxed">
          A shadcn-compatible component registry. Install any component below
          with the shadcn CLI. To use the <code>@devere-ui</code> namespace
          once, register it in your project:
        </p>
        <CommandRow command={NAMESPACE_SETUP} />
        <p className="text-muted-foreground text-xs">
          (Press <kbd>d</kbd> to toggle dark mode.)
        </p>
      </header>

      <main className="flex flex-col gap-6">
        {items.map((item) => (
          <RegistryCard item={item} key={item.name} />
        ))}
      </main>
    </div>
  );
}

export default App;
