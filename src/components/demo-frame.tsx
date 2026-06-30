import { Maximize2, Minimize2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/devere-ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function DemoFrame({
  children,
  className,
  expandable = false,
  overflow = "auto",
}: {
  children: ReactNode;
  className?: string;
  expandable?: boolean;
  overflow?: "hidden" | "auto";
}) {
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background p-4 sm:p-6">
        <Card className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {expandable && (
            <Button
              aria-label="Shrink preview"
              className="absolute top-3 right-3 z-10"
              onClick={() => setExpanded(false)}
              size="icon-sm"
              variant="outline"
            >
              <Minimize2 />
            </Button>
          )}
          <CardContent
            className={cn(
              `flex min-h-0 flex-1 flex-col ${overflow === "hidden" ? "overflow-hidden" : "overflow-auto"}`,
              expandable && "pt-8"
            )}
          >
            {children}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card
      className="relative min-h-24 w-full min-w-0 border border-dashed bg-muted/30 shadow-none ring-0"
      size="sm"
    >
      {expandable && (
        <Button
          aria-label="Expand preview"
          className="absolute top-3 right-3 z-10"
          onClick={() => setExpanded(true)}
          size="icon-sm"
          variant="outline"
        >
          <Maximize2 />
        </Button>
      )}
      <CardContent
        className={cn(
          "flex min-h-24 w-full min-w-0 items-center justify-center",
          expandable && "pt-10",
          className
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}

export { DemoFrame };
