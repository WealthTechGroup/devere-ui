import { DownloadCloudIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import logo from "@/assets/logo.png";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/devere-ui/button";
import { LoadingScreen } from "@/components/devere-ui/loading-screen";
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
