import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/devere-ui/button";
import { ThemeToggle } from "@/components/devere-ui/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NAMESPACE_SETUP } from "@/registry-items";

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

export function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>deVere UI</CardTitle>
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
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="max-w-prose text-muted-foreground text-sm leading-relaxed">
            A shadcn-compatible component registry. Pick a component from the
            sidebar to preview it and copy the install command. Register the{" "}
            <code>@devere-ui</code> namespace once in your project:
          </p>
          <CommandRow command={NAMESPACE_SETUP} />
          <p className="text-muted-foreground text-xs">
            Press <kbd>d</kbd> to toggle dark mode.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
