import type { ReactNode } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/devere-ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TAB_ITEMS = [
  { label: "Overview", value: "overview" },
  { label: "Analytics", value: "analytics" },
  { label: "Reports", value: "reports" },
] as const;

function TabsContentPreview({ children }: { children: ReactNode }) {
  return (
    <Card className="bg-muted/30 shadow-none ring-0" size="sm">
      <CardContent className="text-muted-foreground text-xs">
        {children}
      </CardContent>
    </Card>
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

export { TabsDemo };
