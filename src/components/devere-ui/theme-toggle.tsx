import type { VariantProps } from "class-variance-authority";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/devere-ui/theme-provider";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function ThemeToggle({
  className,
  variant = "ghost",
  size = "icon",
  align = "start",
  title,
}: {
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"];
  title?: string;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button className={className} size={size} variant={variant}>
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
            {title}
          </Button>
        }
      />
      <DropdownMenuContent align={align}>
        <DropdownMenuItem
          className={cn(
            theme === "light" && "pointer-events-none text-primary"
          )}
          onClick={() => setTheme("light")}
        >
          <Sun className="text-inherit" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(theme === "dark" && "pointer-events-none text-primary")}
          onClick={() => setTheme("dark")}
        >
          <Moon className="text-inherit" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            theme === "system" && "pointer-events-none text-primary"
          )}
          onClick={() => setTheme("system")}
        >
          <Monitor className="text-inherit" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeToggle };
