import type { ReactNode } from "react";

import { BadgeDemo } from "@/demos/badge-demo";
import { ButtonDemo } from "@/demos/button-demo";
import { CircularProgressDemo } from "@/demos/circular-progress-demo";
import { DashboardDemo } from "@/demos/dashboard-demo";
import { DialogDemo } from "@/demos/dialog-demo";
import { DrawerDemo } from "@/demos/drawer-demo";
import { FormattersDemo } from "@/demos/formatters-demo";
import { LinearProgressDemo } from "@/demos/linear-progress-demo";
import { LoadingScreenDemo } from "@/demos/loading-screen-demo";
import { MicrosoftLoginDemo } from "@/demos/microsoft-login-demo";
import { NotFoundDemo } from "@/demos/not-found-demo";
import { TableDemo } from "@/demos/table-demo";
import { TabsDemo } from "@/demos/tabs-demo";
import { TasksDataTableDemo } from "@/demos/tasks-data-table-demo";
import { ThemeToggleDemo } from "@/demos/theme-toggle-demo";

export type RegistryItem = {
  demo: ReactNode;
  description: string;
  expandable?: boolean;
  name: string;
  overflow?: "hidden" | "auto";
  previewClassName?: string;
  title: string;
};

const registryItemsUnsorted: RegistryItem[] = [
  {
    name: "badge",
    title: "Badge",
    description:
      "A pill-shaped badge with semantic variants plus every Tailwind color at sm, md and lg sizes.",
    demo: <BadgeDemo />,
    previewClassName: "items-start justify-start",
  },
  {
    name: "button",
    title: "Button",
    description:
      "A button built on the shadcn button that adds a loading state with a spinner and optional loading text.",
    demo: <ButtonDemo />,
  },
  {
    name: "circular-progress",
    title: "Circular Progress",
    description:
      "An indeterminate circular spinner recreating the Material UI CircularProgress animation in self-contained CSS, with lucide-style defaults.",
    demo: <CircularProgressDemo />,
  },
  {
    name: "dashboard",
    title: "Dashboard",
    description: "A dashboard with a sidebar and a main content area.",
    demo: <DashboardDemo />,
    previewClassName:
      "items-start justify-start overflow-hidden px-0 -my-(--card-spacing)",
  },
  {
    name: "data-table",
    title: "Data Table",
    description:
      "A TanStack Table wrapper with sorting, filters, pagination and column visibility. Tasks example inspired by shadcn.",
    demo: <TasksDataTableDemo />,
    expandable: true,
    previewClassName: "items-start justify-start overflow-auto",
    overflow: "hidden",
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
    name: "formatters",
    title: "Formatters",
    description:
      "Currency, number and string formatters using Intl with compact notation and currency display helpers.",
    demo: <FormattersDemo />,
    previewClassName: "items-start justify-start",
  },
  {
    name: "linear-progress",
    title: "Linear Progress",
    description:
      "An indeterminate linear progress bar with two color bars sweeping across a faint track, recreated in self-contained CSS.",
    demo: <LinearProgressDemo />,
  },
  {
    name: "loading-screen",
    title: "Loading Screen",
    description:
      "A full-area loading state with a spinning ring and optional centered logo.",
    demo: <LoadingScreenDemo />,
  },
  {
    name: "microsoft-login",
    title: "Microsoft Login",
    description:
      "A centered sign-in page with a Microsoft SSO button, title, description and admin contact note.",
    demo: <MicrosoftLoginDemo />,
    previewClassName: "px-0 -my-(--card-spacing)",
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
    name: "tabs",
    title: "Tabs",
    description:
      "Tabs with default and line variants, horizontal and vertical orientation and an animated sliding indicator.",
    demo: <TabsDemo />,
    expandable: true,
    previewClassName: "items-start justify-start overflow-auto",
  },
  {
    name: "theme-toggle",
    title: "Theme Toggle",
    description:
      "A dropdown to switch between light, dark and system theme. Wrap your app in ThemeProvider (included on install).",
    demo: <ThemeToggleDemo />,
  },
];

export const registryItems = [...registryItemsUnsorted].sort((a, b) =>
  a.title.localeCompare(b.title)
);

export const NAMESPACE_SETUP =
  "npx shadcn@latest registry add '@devere-ui=https://wealthtechgroup.github.io/devere-ui/r/{name}.json'";

export function getRegistryItem(name: string) {
  return registryItems.find((item) => item.name === name);
}
