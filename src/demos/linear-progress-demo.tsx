import { LinearProgress } from "@/components/devere-ui/linear-progress";

function LinearProgressDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <LinearProgress />
      <LinearProgress className="h-2 rounded-full" />
    </div>
  );
}

export { LinearProgressDemo };
