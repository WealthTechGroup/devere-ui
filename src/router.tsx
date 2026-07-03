import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";

import logo from "@/assets/logo.png";
import { ComponentPage } from "@/component-page";
import { Dashboard } from "@/components/devere-ui/dashboard";
import { HomePage } from "@/page";
import { registryItems } from "@/registry-items";

const sidebarItems = [
  {
    items: [
      {
        title: "Overview",
        icon: <HomeIcon />,
        to: "/",
      },
    ],
  },
  {
    label: "Components",
    items: registryItems.map((item) => ({
      title: item.title,
      to: `/${item.name}`,
    })),
  },
];

const rootRoute = createRootRoute({
  component: () => (
    <Dashboard
      collapsible="offcanvas"
      homePath="/"
      items={sidebarItems}
      logo={logo}
      signOut={() => {
        //
      }}
      title="deVere UI"
      user={{
        initials: "DU",
        name: "deVere UI",
        email: "registry@devere-ui.dev",
      }}
    >
      <Outlet />
    </Dashboard>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const componentRoutes = registryItems.map((item) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: `/${item.name}`,
    component: () => <ComponentPage item={item} />,
  })
);

const routeTree = rootRoute.addChildren([indexRoute, ...componentRoutes]);

const router = createRouter({
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router };
