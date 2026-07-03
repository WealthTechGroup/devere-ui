import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const badgeColors = [
  // Tailwind colors: https://tailwindcss.com/docs/colors
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "taupe",
  "mauve",
  "mist",
  "olive",
] as const;

export type BadgeColor = (typeof badgeColors)[number];

const badgeColorVariants = {
  red: "bg-red-600/10 text-red-600 ring-red-500/20 [a]:hover:bg-red-600/20 dark:bg-red-400/20 dark:text-red-400 dark:ring-red-400/20 dark:[a]:hover:bg-red-400/30",
  orange:
    "bg-orange-600/10 text-orange-600 ring-orange-500/20 [a]:hover:bg-orange-600/20 dark:bg-orange-400/20 dark:text-orange-400 dark:ring-orange-400/20 dark:[a]:hover:bg-orange-400/30",
  amber:
    "bg-amber-600/10 text-amber-600 ring-amber-500/20 [a]:hover:bg-amber-600/20 dark:bg-amber-400/20 dark:text-amber-400 dark:ring-amber-400/20 dark:[a]:hover:bg-amber-400/30",
  yellow:
    "bg-yellow-600/10 text-yellow-600 ring-yellow-500/20 [a]:hover:bg-yellow-600/20 dark:bg-yellow-400/20 dark:text-yellow-400 dark:ring-yellow-400/20 dark:[a]:hover:bg-yellow-400/30",
  lime: "bg-lime-600/10 text-lime-600 ring-lime-500/20 [a]:hover:bg-lime-600/20 dark:bg-lime-400/20 dark:text-lime-400 dark:ring-lime-400/20 dark:[a]:hover:bg-lime-400/30",
  green:
    "bg-green-600/10 text-green-600 ring-green-500/20 [a]:hover:bg-green-600/20 dark:bg-green-400/20 dark:text-green-400 dark:ring-green-400/20 dark:[a]:hover:bg-green-400/30",
  emerald:
    "bg-emerald-600/10 text-emerald-600 ring-emerald-500/20 [a]:hover:bg-emerald-600/20 dark:bg-emerald-400/20 dark:text-emerald-400 dark:ring-emerald-400/20 dark:[a]:hover:bg-emerald-400/30",
  teal: "bg-teal-600/10 text-teal-600 ring-teal-500/20 [a]:hover:bg-teal-600/20 dark:bg-teal-400/20 dark:text-teal-400 dark:ring-teal-400/20 dark:[a]:hover:bg-teal-400/30",
  cyan: "bg-cyan-600/10 text-cyan-600 ring-cyan-500/20 [a]:hover:bg-cyan-600/20 dark:bg-cyan-400/20 dark:text-cyan-400 dark:ring-cyan-400/20 dark:[a]:hover:bg-cyan-400/30",
  sky: "bg-sky-600/10 text-sky-600 ring-sky-500/20 [a]:hover:bg-sky-600/20 dark:bg-sky-400/20 dark:text-sky-400 dark:ring-sky-400/20 dark:[a]:hover:bg-sky-400/30",
  blue: "bg-blue-600/10 text-blue-600 ring-blue-500/20 [a]:hover:bg-blue-600/20 dark:bg-blue-400/20 dark:text-blue-400 dark:ring-blue-400/20 dark:[a]:hover:bg-blue-400/30",
  indigo:
    "bg-indigo-600/10 text-indigo-600 ring-indigo-500/20 [a]:hover:bg-indigo-600/20 dark:bg-indigo-400/20 dark:text-indigo-400 dark:ring-indigo-400/20 dark:[a]:hover:bg-indigo-400/30",
  violet:
    "bg-violet-600/10 text-violet-600 ring-violet-500/20 [a]:hover:bg-violet-600/20 dark:bg-violet-400/20 dark:text-violet-400 dark:ring-violet-400/20 dark:[a]:hover:bg-violet-400/30",
  purple:
    "bg-purple-600/10 text-purple-600 ring-purple-500/20 [a]:hover:bg-purple-600/20 dark:bg-purple-400/20 dark:text-purple-400 dark:ring-purple-400/20 dark:[a]:hover:bg-purple-400/30",
  fuchsia:
    "bg-fuchsia-600/10 text-fuchsia-600 ring-fuchsia-500/20 [a]:hover:bg-fuchsia-600/20 dark:bg-fuchsia-400/20 dark:text-fuchsia-400 dark:ring-fuchsia-400/20 dark:[a]:hover:bg-fuchsia-400/30",
  pink: "bg-pink-600/10 text-pink-600 ring-pink-500/20 [a]:hover:bg-pink-600/20 dark:bg-pink-400/20 dark:text-pink-400 dark:ring-pink-400/20 dark:[a]:hover:bg-pink-400/30",
  rose: "bg-rose-600/10 text-rose-600 ring-rose-500/20 [a]:hover:bg-rose-600/20 dark:bg-rose-400/20 dark:text-rose-400 dark:ring-rose-400/20 dark:[a]:hover:bg-rose-400/30",
  slate:
    "bg-slate-600/10 text-slate-600 ring-slate-500/20 [a]:hover:bg-slate-600/20 dark:bg-slate-400/20 dark:text-slate-400 dark:ring-slate-400/20 dark:[a]:hover:bg-slate-400/30",
  gray: "bg-gray-600/10 text-gray-600 ring-gray-500/20 [a]:hover:bg-gray-600/20 dark:bg-gray-400/20 dark:text-gray-400 dark:ring-gray-400/20 dark:[a]:hover:bg-gray-400/30",
  zinc: "bg-zinc-600/10 text-zinc-600 ring-zinc-500/20 [a]:hover:bg-zinc-600/20 dark:bg-zinc-400/20 dark:text-zinc-400 dark:ring-zinc-400/20 dark:[a]:hover:bg-zinc-400/30",
  neutral:
    "bg-neutral-600/10 text-neutral-600 ring-neutral-500/20 [a]:hover:bg-neutral-600/20 dark:bg-neutral-400/20 dark:text-neutral-400 dark:ring-neutral-400/20 dark:[a]:hover:bg-neutral-400/30",
  stone:
    "bg-stone-600/10 text-stone-600 ring-stone-500/20 [a]:hover:bg-stone-600/20 dark:bg-stone-400/20 dark:text-stone-400 dark:ring-stone-400/20 dark:[a]:hover:bg-stone-400/30",
  taupe:
    "bg-taupe-600/10 text-taupe-600 ring-taupe-500/20 [a]:hover:bg-taupe-600/20 dark:bg-taupe-400/20 dark:text-taupe-400 dark:ring-taupe-400/20 dark:[a]:hover:bg-taupe-400/30",
  mauve:
    "bg-mauve-600/10 text-mauve-600 ring-mauve-500/20 [a]:hover:bg-mauve-600/20 dark:bg-mauve-400/20 dark:text-mauve-400 dark:ring-mauve-400/20 dark:[a]:hover:bg-mauve-400/30",
  mist: "bg-mist-600/10 text-mist-600 ring-mist-500/20 [a]:hover:bg-mist-600/20 dark:bg-mist-400/20 dark:text-mist-400 dark:ring-mist-400/20 dark:[a]:hover:bg-mist-400/30",
  olive:
    "bg-olive-600/10 text-olive-600 ring-olive-500/20 [a]:hover:bg-olive-600/20 dark:bg-olive-400/20 dark:text-olive-400 dark:ring-olive-400/20 dark:[a]:hover:bg-olive-400/30",
} satisfies Record<BadgeColor, string>;

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-transparent font-medium transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      size: {
        sm: "h-5 px-2 py-0.5 text-[0.75rem] [&>svg]:size-3!",
        md: "h-6 px-2.5 py-0.5 text-[0.8125rem] [&>svg]:size-3.5!",
        lg: "h-7 px-3 py-1 text-[0.875rem] [&>svg]:size-4!",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type BadgeProps = useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    color?: BadgeColor;
  };

function Badge({
  className,
  color,
  size = "md",
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          badgeVariants({ size }),
          color && "ring-1 ring-inset",
          color && badgeColorVariants[color],
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      color,
      size,
    },
  });
}

export { Badge, badgeVariants };
