import { Loader2Icon } from "lucide-react";
import type * as React from "react";

import { Button as ButtonPrimitive } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> & {
  loading?: boolean;
  loadingText?: string;
};

function Button({
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      aria-busy={loading}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2Icon className="animate-spin" />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}

export type { ButtonProps };
export { Button };
