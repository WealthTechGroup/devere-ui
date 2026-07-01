import { createMemoryHistory } from "@tanstack/history";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useRouterState,
} from "@tanstack/react-router";
import {
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Dashboard } from "@/components/devere-ui/dashboard";

const dashboardItems = [
  {
    label: "Overview",
    items: [
      {
        title: "Home",
        icon: <HomeIcon />,
        to: "/",
      },
      {
        title: "Dashboard",
        icon: <LayoutDashboardIcon />,
        to: "/dashboard",
      },
      {
        title: "Reports",
        icon: <FileTextIcon />,
        to: "/reports",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Settings",
        icon: <SettingsIcon />,
        to: "/settings",
      },
    ],
  },
];

function DashboardDemoContent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="p-6 text-muted-foreground text-sm">
      Current path: <code className="text-foreground">{pathname}</code>
    </div>
  );
}

const demoLayoutRoute = createRootRoute({
  component: () => (
    <Dashboard
      items={dashboardItems}
      logo={logo}
      mainClassName="overflow-hidden"
      resetScroll={false}
      sideBarClassName="absolute h-full"
      signOut={() => {
        console.log("signOut");
      }}
      title="WealthTech Group"
      user={{
        initials: "WG",
        name: "WealthTech Group",
        email: "info@wealthtech.group",
      }}
    >
      <Outlet />
    </Dashboard>
  ),
});

const demoIndexRoute = createRoute({
  getParentRoute: () => demoLayoutRoute,
  path: "/",
  component: DashboardDemoContent,
});

const demoDashboardRoute = createRoute({
  getParentRoute: () => demoLayoutRoute,
  path: "/dashboard",
  component: DashboardDemoContent,
});

const demoReportsRoute = createRoute({
  getParentRoute: () => demoLayoutRoute,
  path: "/reports",
  component: DashboardDemoContent,
});

const demoSettingsRoute = createRoute({
  getParentRoute: () => demoLayoutRoute,
  path: "/settings",
  component: DashboardDemoContent,
});

const demoRouteTree = demoLayoutRoute.addChildren([
  demoIndexRoute,
  demoDashboardRoute,
  demoReportsRoute,
  demoSettingsRoute,
]);

const demoRouter = createRouter({
  routeTree: demoRouteTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

export function DashboardDemo() {
  return (
    <div className="relative h-150 w-full">
      <RouterProvider router={demoRouter} />
    </div>
  );
}
