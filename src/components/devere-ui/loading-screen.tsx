import type { ComponentProps } from "react";

import { CircularProgress } from "@/components/devere-ui/circular-progress";
import { cn } from "@/lib/utils";

export function LoadingScreen({
  size = 96,
  className,
  logoUrl,
  ...props
}: { size?: number; logoUrl?: string } & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
      {...props}
    >
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: size + 14, height: size + 14 }}
      >
        <CircularProgress
          className="absolute inset-0 text-primary"
          size={size + 14}
          thickness={2}
        />
        {logoUrl && (
          <img alt="deVere Group" height={size} src={logoUrl} width={size} />
        )}
      </div>
    </div>
  );
}
