import { CopyButton } from "@/components/copy-button";
import { DemoFrame } from "@/components/demo-frame";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RegistryItem } from "@/registry-items";

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

export function ComponentPage({ item }: { item: RegistryItem }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <DemoFrame
            className={item.previewClassName}
            expandable={item.expandable}
            overflow={item.overflow}
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
    </div>
  );
}
