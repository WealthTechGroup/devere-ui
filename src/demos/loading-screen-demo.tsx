import logo from "@/assets/logo.png";
import { LoadingScreen } from "@/components/devere-ui/loading-screen";

function LoadingScreenDemo() {
  return <LoadingScreen className="h-48 w-full" logoUrl={logo} size={72} />;
}

export { LoadingScreenDemo };
