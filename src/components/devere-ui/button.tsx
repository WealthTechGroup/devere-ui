import type * as React from "react";
import { CircularProgress } from "@/components/devere-ui/circular-progress";
import { Button as ButtonPrimitive } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> & {
  loading?: boolean;
};

function Button({
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      aria-busy={loading}
      className={cn("relative", className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <CircularProgress
          className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2"
          data-loader
        />
      )}
      <span className={cn("contents", loading && "text-transparent")}>
        {children}
      </span>
    </ButtonPrimitive>
  );
}

export type { ButtonProps };
export { Button };
