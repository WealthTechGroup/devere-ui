import { FileTextIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import { Dashboard, type NavLinkProps } from "@/components/devere-ui/dashboard";

function DemoLink({ to, ...props }: NavLinkProps) {
  return <button className="cursor-pointer" {...props} />;
}

const titleMap: Map<string, string> = new Map([
  ["", "Dashboard"],
  ["dashboard", "Dashboard"],
  ["settings", "Settings"],
]);

export function DashboardDemo() {
  return (
    <div className="relative h-150 w-full">
      <Dashboard
        items={[
          {
            label: "Overview",
            items: [
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
        ]}
        linkComponent={DemoLink}
        logo={logo}
        sideBarClassName="absolute h-full"
        signOut={() => {
          console.log("signOut");
        }}
        title="WealthTech Group"
        titleMap={titleMap}
        user={{
          initials: "WG",
          name: "WealthTech Group",
          email: "info@wealthtech.group",
        }}
      >
        <div />
      </Dashboard>
    </div>
  );
}
