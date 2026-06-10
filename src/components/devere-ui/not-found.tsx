import { FileQuestionIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function NotFound({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or may have been moved.",
  icon = <FileQuestionIcon className="size-6" />,
  className,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6",
        className
      )}
    >
      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        <Card className="w-full shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export { NotFound };
