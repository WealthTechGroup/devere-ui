import { ThemeToggle } from "@/components/devere-ui/theme-toggle";

function ThemeToggleDemo() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle size="sm" title="Theme" variant="outline" />
      <ThemeToggle size="icon-sm" variant="outline" />
    </div>
  );
}

export { ThemeToggleDemo };
