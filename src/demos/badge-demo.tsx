import { ArrowUpRightIcon, BadgeCheckIcon, BookmarkIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Badge,
  type BadgeColor,
  badgeColors,
} from "@/components/devere-ui/badge";

const badgeSizes = ["sm", "md", "lg"] as const;

function DemoSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      {children}
    </div>
  );
}

function BadgeDemo() {
  return (
    <div className="flex flex-col gap-8">
      <DemoSection label="With icon">
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="green">
            <BadgeCheckIcon data-icon="inline-start" />
            Verified
          </Badge>
          <Badge color="blue">
            Bookmark
            <BookmarkIcon data-icon="inline-end" />
          </Badge>
          <Badge color="violet" render={<a href="/" />}>
            Open
            <ArrowUpRightIcon data-icon="inline-end" />
          </Badge>
        </div>
      </DemoSection>

      <DemoSection label="Sizes with icon">
        <div className="flex flex-wrap items-center gap-3">
          {badgeSizes.map((size) => (
            <Badge color="emerald" key={size} size={size}>
              <BadgeCheckIcon data-icon="inline-start" />
              Label
            </Badge>
          ))}
        </div>
      </DemoSection>

      <DemoSection label="Colors">
        <div className="flex flex-col gap-2.5">
          {badgeColors.map((color: BadgeColor) => (
            <div className="flex flex-wrap items-center gap-3" key={color}>
              {badgeSizes.map((size) => (
                <Badge
                  color={color}
                  key={size}
                  render={<a href="/" />}
                  size={size}
                >
                  Label
                </Badge>
              ))}
            </div>
          ))}
        </div>
      </DemoSection>
    </div>
  );
}

export { BadgeDemo };
