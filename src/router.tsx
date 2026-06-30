import { createRootRoute, createRouter } from "@tanstack/react-router";
import App from "@/page";

const rootRoute = createRootRoute({
  component: App,
});

const router = createRouter({
  routeTree: rootRoute,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router };
