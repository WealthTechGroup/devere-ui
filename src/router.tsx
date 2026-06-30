import { createRootRoute, createRouter } from "@tanstack/react-router";
import { dataTableSearchSchema } from "@/lib/data-table-url-state";
import App from "@/page";

const rootRoute = createRootRoute({
  component: App,
  validateSearch: (search) => dataTableSearchSchema.parse(search),
});

const router = createRouter({
  routeTree: rootRoute,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router };
