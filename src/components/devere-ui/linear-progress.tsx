import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const BAR1_ANIMATION =
  "linear-progress-bar1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite";
const BAR2_ANIMATION =
  "linear-progress-bar2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite";

const KEYFRAMES = `
@keyframes linear-progress-bar1 {
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
}

@keyframes linear-progress-bar2 {
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
}`;

/**
 * An indeterminate linear progress bar. Two color bars sweep across a faint
 * track to indicate ongoing, unmeasured work (e.g. a loading table or request).
 *
 * The keyframes ship inline with the component, so it never relies on global
 * styles.
 */
export function LinearProgress({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-busy="true"
      className={cn(
        "relative block h-1 w-full overflow-hidden bg-primary/20",
        className
      )}
      role="progressbar"
      {...props}
    >
      <style>{KEYFRAMES}</style>
      <div
        className="absolute inset-y-0 bg-primary"
        style={{ animation: BAR1_ANIMATION }}
      />
      <div
        className="absolute inset-y-0 bg-primary"
        style={{ animation: BAR2_ANIMATION }}
      />
    </div>
  );
}
