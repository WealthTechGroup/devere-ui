import {
  Badge,
  type BadgeColor,
  badgeColors,
} from "@/components/devere-ui/badge";

const badgeSizes = ["sm", "md", "lg"] as const;

function BadgeDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2.5">
        {badgeColors.map((color: BadgeColor) => (
          <div className="flex flex-wrap items-center gap-3" key={color}>
            {badgeSizes.map((size) => (
              <Badge
                color={color}
                key={size}
                render={<a href="/">Label</a>}
                size={size}
              >
                Label
              </Badge>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export { BadgeDemo };
