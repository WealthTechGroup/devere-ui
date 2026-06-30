import { Button } from "@/components/devere-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function MicrosoftLogo() {
  return (
    <svg
      aria-label="Microsoft logo"
      height="18"
      role="img"
      viewBox="0 0 21 21"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Microsoft</title>
      <rect fill="#f25022" height="9" width="9" x="1" y="1" />
      <rect fill="#00a4ef" height="9" width="9" x="1" y="11" />
      <rect fill="#7fba00" height="9" width="9" x="11" y="1" />
      <rect fill="#ffb900" height="9" width="9" x="11" y="11" />
    </svg>
  );
}

type MicrosoftLoginProps = {
  onSignIn: () => void;
  title: string;
  description: string;
  className?: string;
};

export function MicrosoftLogin({
  onSignIn,
  title,
  description,
  className,
}: MicrosoftLoginProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh w-full items-center justify-center bg-muted/40 p-6",
        className
      )}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-2">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full gap-3"
              onClick={onSignIn}
              size="lg"
              variant="outline"
            >
              <MicrosoftLogo />
              Sign in with Microsoft
            </Button>
          </CardContent>
        </Card>
        <p className="text-center text-muted-foreground text-xs">
          Contact your administrator if you don&apos;t have access.
        </p>
      </div>
    </div>
  );
}
