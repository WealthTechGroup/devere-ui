import { Loader2Icon } from "lucide-react";
import type * as React from "react";

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
      className={cn(loading && "text-transparent", "relative", className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <Loader2Icon className="icon-loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary-foreground!" />
      )}
      {children}
    </ButtonPrimitive>
  );
}

export type { ButtonProps };
export { Button };
