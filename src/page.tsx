import { DownloadCloudIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import logo from "@/assets/logo.png";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/devere-ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/devere-ui/dialog";
import { LoadingScreen } from "@/components/devere-ui/loading-screen";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/devere-ui/tabs";
import { ThemeToggle } from "@/components/devere-ui/theme-toggle";
import { cn } from "@/lib/utils";

const NAMESPACE_SETUP =
  "npx shadcn@latest registry add '@devere-ui=https://wealthtechgroup.github.io/devere-ui/r/{name}.json'";

interface RegistryItem {
  demo: ReactNode;
  description: string;
  name: string;
  title: string;
}

function LoadingButtonDemo() {
  const [loading, setLoading] = useState(false);
  const [iconLoading, setIconLoading] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        Save changes
      </Button>
      <Button loading variant="outline">
        Loading
      </Button>
      <Button
        loading={iconLoading}
        onClick={() => {
          setIconLoading(true);
          setTimeout(() => setIconLoading(false), 2000);
        }}
        size="icon"
      >
        <DownloadCloudIcon />
      </Button>
      <Button loading size="icon" variant="outline">
        <DownloadCloudIcon />
      </Button>
    </div>
  );
}

const TAB_ITEMS = [
  { label: "Overview", value: "overview" },
  { label: "Analytics", value: "analytics" },
  { label: "Reports", value: "reports" },
] as const;

function TabsContentPreview({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2 text-muted-foreground text-xs">
      {children}
    </div>
  );
}

function TabsExample({
  label,
  orientation = "horizontal",
  variant = "default",
}: {
  label: string;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "line";
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <Tabs
        className={cn("w-full", orientation === "vertical" && "min-h-28")}
        defaultValue="overview"
        orientation={orientation}
      >
        <TabsList variant={variant}>
          {TAB_ITEMS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TAB_ITEMS.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <TabsContentPreview>{item.label} content</TabsContentPreview>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function TabsDemo() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <TabsExample label="Horizontal · Default" />
      <TabsExample label="Horizontal · Line" variant="line" />
      <TabsExample label="Vertical · Default" orientation="vertical" />
      <TabsExample
        label="Vertical · Line"
        orientation="vertical"
        variant="line"
      />
    </div>
  );
}

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Open dialog
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-muted-foreground text-sm">
            Update your name, email, and preferences. The body scrolls when
            content exceeds the dialog height.
          </p>
        </DialogBody>
        <DialogFooter closeButtonText="Cancel" showCloseButton>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const items: RegistryItem[] = [
  {
    name: "button",
    title: "Button",
    description:
      "A button built on the shadcn button that adds a loading state with a spinner and optional loading text.",
    demo: <LoadingButtonDemo />,
  },
  {
    name: "loading-screen",
    title: "Loading Screen",
    description:
      "A full-area loading state with a spinning ring and optional centered logo.",
    demo: <LoadingScreen className="h-48 w-full" logoUrl={logo} size={72} />,
  },
  {
    name: "theme-toggle",
    title: "Theme Toggle",
    description:
      "A dropdown to switch between light, dark, and system theme. Wrap your app in ThemeProvider (included on install).",
    demo: <ThemeToggle size="icon-sm" variant="outline" />,
  },
  {
    name: "tabs",
    title: "Tabs",
    description:
      "Tabs with default and line variants, horizontal and vertical orientation and an animated sliding indicator.",
    demo: <TabsDemo />,
  },
  {
    name: "dialog",
    title: "Dialog",
    description:
      "A modal dialog with overlay, header, scrollable body, footer and an optional close button.",
    demo: <DialogDemo />,
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
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/40 py-1 pr-1 pl-3",
        className
      )}
    >
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-muted-foreground text-xs">
        {command}
      </code>
      <CopyButton value={command} />
    </div>
  );
}

function RegistryCard({ item }: { item: RegistryItem }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium text-base">{item.title}</h2>
        <p className="text-muted-foreground text-sm">{item.description}</p>
      </div>

      <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6">
        {item.demo}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Install
        </span>
        <CommandRow command={`npx shadcn@latest add @devere-ui/${item.name}`} />
      </div>
    </section>
  );
}

export function App() {
  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-6 py-12">
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
