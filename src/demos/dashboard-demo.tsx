import {
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import logo from "@/assets/logo.png";
import { Dashboard, type NavLinkProps } from "@/components/devere-ui/dashboard";
import { cn } from "@/lib/utils";

const TRAILING_SLASH_PATTERN = /\/$/;

const DEMO_ROUTES = ["", "dashboard", "reports", "settings"] as const;

function normalizePath(path: string) {
  return path.replace(TRAILING_SLASH_PATTERN, "") || "/";
}

function demoPath(segment: (typeof DEMO_ROUTES)[number] = "") {
  const base = import.meta.env.BASE_URL;
  return segment ? `${base}${segment}` : base;
}

function resolveDemoPathname(pathname: string) {
  const normalized = normalizePath(pathname);

  for (const segment of DEMO_ROUTES) {
    if (normalizePath(demoPath(segment)) === normalized) {
      return demoPath(segment);
    }
  }

  return demoPath();
}

type DemoNavigationContextValue = {
  navigate: (to: string) => void;
};

const DemoNavigationContext = createContext<DemoNavigationContextValue | null>(
  null
);

function DemoLink({
  to,
  pathname,
  onClick,
  className,
  ...props
}: NavLinkProps) {
  const navigation = useContext(DemoNavigationContext);
  const isActive =
    pathname !== undefined && normalizePath(pathname) === normalizePath(to);

  return (
    <a
      {...props}
      className={cn("font-medium", className)}
      data-active={isActive ? "" : undefined}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        event.preventDefault();
        navigation?.navigate(to);
      }}
    />
  );
}

export function DashboardDemo() {
  const [pathname, setPathname] = useState(() =>
    resolveDemoPathname(window.location.pathname)
  );

  const navigate = useCallback(
    (to: string) => {
      if (normalizePath(to) === normalizePath(pathname)) {
        return;
      }
      window.history.pushState({ demoNavigation: true }, "", to);
      setPathname(to);
    },
    [pathname]
  );

  useEffect(() => {
    const onPopState = () => {
      setPathname(resolveDemoPathname(window.location.pathname));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <DemoNavigationContext.Provider value={{ navigate }}>
      <div className="relative h-150 w-full">
        <Dashboard
          homePath={demoPath()}
          items={[
            {
              label: "Overview",
              items: [
                {
                  title: "Home",
                  icon: <HomeIcon />,
                  to: demoPath(),
                },
                {
                  title: "Dashboard",
                  icon: <LayoutDashboardIcon />,
                  to: demoPath("dashboard"),
                },
                {
                  title: "Reports",
                  icon: <FileTextIcon />,
                  to: demoPath("reports"),
                },
              ],
            },
            {
              label: "Settings",
              items: [
                {
                  title: "Settings",
                  icon: <SettingsIcon />,
                  to: demoPath("settings"),
                },
              ],
            },
          ]}
          linkComponent={DemoLink}
          logo={logo}
          pathname={pathname}
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
          <div className="p-6 text-muted-foreground text-sm">
            Current path: <code className="text-foreground">{pathname}</code>
          </div>
        </Dashboard>
      </div>
    </DemoNavigationContext.Provider>
  );
}
