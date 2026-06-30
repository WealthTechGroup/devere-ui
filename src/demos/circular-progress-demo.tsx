import { CircularProgress } from "@/components/devere-ui/circular-progress";

function CircularProgressDemo() {
  return (
    <div className="flex items-center gap-8 text-primary">
      <CircularProgress />
      <CircularProgress size={36} />
      <CircularProgress size={48} thickness={5} />
    </div>
  );
}

export { CircularProgressDemo };
