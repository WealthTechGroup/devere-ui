import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const VIEWBOX = 44;
const DEFAULT_SIZE = 24;
const DEFAULT_THICKNESS = 3.6;

const ROTATE_ANIMATION = "circular-progress-rotate 1.4s linear infinite";
const DASH_ANIMATION = "circular-progress-dash 1.4s ease-in-out infinite";

const KEYFRAMES = `
@keyframes circular-progress-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes circular-progress-dash {
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }
  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
}`;

type CircularProgressProps = ComponentProps<"svg"> & {
  size?: number;
  thickness?: number;
};

/**
 * An indeterminate circular spinner that recreates the Material UI
 * CircularProgress animation: the SVG spins while the arc grows and shrinks via
 * an animated stroke dash.
 *
 * The keyframes ship inline with the component, so it never relies on global
 * styles. Defaults mirror lucide icons (`24px`, `currentColor`) so it can drop
 * in wherever an icon would.
 */
export function CircularProgress({
  size = DEFAULT_SIZE,
  thickness = DEFAULT_THICKNESS,
  className,
  style,
  ...props
}: CircularProgressProps) {
  return (
    <svg
      aria-busy="true"
      className={cn("shrink-0", className)}
      height={size}
      role="progressbar"
      style={{ animation: ROTATE_ANIMATION, ...style }}
      viewBox={`${VIEWBOX / 2} ${VIEWBOX / 2} ${VIEWBOX} ${VIEWBOX}`}
      width={size}
      {...props}
    >
      <title>Loading…</title>
      <style>{KEYFRAMES}</style>
      <circle
        cx={VIEWBOX}
        cy={VIEWBOX}
        fill="none"
        r={(VIEWBOX - thickness) / 2}
        stroke="currentColor"
        strokeWidth={thickness}
        style={{ animation: DASH_ANIMATION }}
      />
    </svg>
  );
}

export type { CircularProgressProps };
