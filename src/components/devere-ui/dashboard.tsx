import { ChevronsUpDownIcon, LogOutIcon, MenuIcon } from "lucide-react";
import {
  type ComponentProps,
  type ComponentType,
  createElement,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";

type NavBadge = { count: number; className?: string };

type NavItem = {
  title?: string;
  icon?: ReactNode;
  to: string;
  badge?: NavBadge;
};

type NavLinkProps = HTMLAttributes<HTMLElement> & { to: string };

type NavLinkComponent = ComponentType<NavLinkProps>;

export type { NavLinkComponent, NavLinkProps };

function resolveLinkRender(LinkComponent: NavLinkComponent, item: NavItem) {
  return (props: HTMLAttributes<HTMLElement>) =>
    createElement(LinkComponent, { ...props, to: item.to });
}

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  items: { label: string; items: NavItem[] }[];
  linkComponent: NavLinkComponent;
  user: {
    initials: string;
    name: string;
    email: string;
  };
  signOut: () => void;
  logo: string;
  homePath?: string;
};

export function AppSidebar({
  title,
  items,
  linkComponent,
  user,
  signOut,
  logo,
  homePath = "/",
  ...props
}: AppSidebarProps) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  const handleSidebarClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 justify-center border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="group-data-[collapsible=icon]:p-1.5!"
              onClick={handleSidebarClick}
              render={resolveLinkRender(linkComponent, {
                title: "",
                icon: undefined,
                to: homePath,
              })}
            >
              <img alt="Dashboard Logo" height={24} src={logo} width={24} />
              <span className="font-bold">{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {items.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    className="border not-data-[status=active]:border-transparent data-[status=active]:border-border data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground [&>svg]:text-muted-foreground"
                    onClick={handleSidebarClick}
                    render={resolveLinkRender(linkComponent, item)}
                    tooltip={item.title}
                  >
                    {item.icon}
                    <span className="truncate">{item.title}</span>
                    {item?.badge?.count ? (
                      <SidebarMenuBadge className={item.badge.className}>
                        {item.badge.count}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <NavUser signOut={signOut} user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

type NavUserProps = {
  user: {
    initials: string;
    name: string;
    email: string;
  };
  signOut: () => void;
};

export function NavUser({ user, signOut }: NavUserProps) {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton className="aria-expanded:bg-muted" size="lg" />
            }
          >
            <Avatar>
              <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <ThemeToggle
                className="w-full justify-start"
                size="default"
                title="Theme"
              />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SidebarMenuTrigger({
  className,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      className={cn(className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      size="icon-sm"
      variant="ghost"
      {...props}
    >
      <MenuIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export function TopBar({ titleMap }: { titleMap?: Map<string, string> }) {
  const pathname = window.location.pathname.split("/")[1];
  const title = titleMap?.get(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 min-w-0 shrink-0 items-center gap-2 border-b bg-background/40 backdrop-blur-sm transition-[width,height] ease-linear">
      <div className="flex min-w-0 max-w-full flex-1 items-center gap-2 px-4">
        <SidebarMenuTrigger className="-ml-1" />
        <Separator
          className="my-auto mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <p className="font-bold">{title}</p>
      </div>
    </header>
  );
}

type DashboardProps = AppSidebarProps & {
  children: ReactNode;
  sideBarClassName?: string;
  className?: string;
  titleMap?: Map<string, string>;
};

export function Dashboard({
  children,
  sideBarClassName,
  className,
  titleMap,
  ...props
}: DashboardProps) {
  return (
    <SidebarProvider>
      <AppSidebar className={sideBarClassName} collapsible="icon" {...props} />
      <main
        className={cn(
          "flex h-full w-full min-w-0 flex-1 flex-col overflow-y-auto",
          className
        )}
      >
        <TopBar titleMap={titleMap} />
        {children}
      </main>
    </SidebarProvider>
  );
}
