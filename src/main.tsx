import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { ThemeProvider } from "@/components/devere-ui/theme-provider.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import App from "./page.tsx";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
);
