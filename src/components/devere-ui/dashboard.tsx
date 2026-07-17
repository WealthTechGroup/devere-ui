import { Link, useMatches } from "@tanstack/react-router";
import { ChevronsUpDownIcon, LogOutIcon, MenuIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo } from "react";
import { Button } from "@/components/devere-ui/button";
import { ThemeToggle } from "@/components/devere-ui/theme-toggle";
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
import { Separator } from "@/components/ui/separator";
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

type NavBadge = { count: number; className?: string };

export type NavItem<TTo extends string = string> = {
  title?: string;
  icon?: ReactNode;
  to: TTo;
  badge?: NavBadge;
  exact?: boolean;
};

export type NavGroup<TTo extends string = string> = {
  label?: string;
  items: NavItem<TTo>[];
};

type LinkTo = ComponentProps<typeof Link>["to"];

const TRAILING_SLASH_PATTERN = /\/$/;

function normalizePath(path: string) {
  return path.replace(TRAILING_SLASH_PATTERN, "") || "/";
}

function getMatchingNavItem<TTo extends string>(
  routeId: string | undefined,
  items: NavGroup<TTo>[]
): NavItem<TTo> | undefined {
  if (!routeId) {
    return;
  }

  const normalizedRouteId = normalizePath(routeId);

  for (const group of items) {
    for (const item of group.items) {
      if (normalizePath(item.to) === normalizedRouteId) {
        return item;
      }
    }
  }
}

function NavLink({
  to,
  resetScroll,
  exact = true,
  ...props
}: Omit<ComponentProps<typeof Link>, "to"> & {
  to: string;
  exact?: boolean;
}) {
  return (
    <Link
      activeOptions={{ exact, includeHash: false, includeSearch: false }}
      activeProps={{ "data-active": true }}
      resetScroll={resetScroll}
      to={to as LinkTo}
      {...props}
    />
  );
}

const navMenuButtonClassName =
  "font-medium data-active:ring-1 data-active:ring-foreground/10 data-active:dark:ring-foreground/15 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>svg]:text-muted-foreground";

type AppSidebarProps<TTo extends string = string> = ComponentProps<
  typeof Sidebar
> & {
  items: NavGroup<TTo>[];
  user?: {
    initials: string;
    name: string;
    email: string;
  };
  signOut?: () => void;
  logo: string;
  title: string;
  homePath?: TTo;
  resetScroll?: boolean;
};

export function AppSidebar<TTo extends string = string>({
  title,
  items,
  user,
  signOut,
  logo,
  collapsible = "icon",
  homePath = "/" as TTo,
  resetScroll = true,
  ...props
}: AppSidebarProps<TTo>) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  const handleSidebarClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar collapsible={collapsible} {...props}>
      <SidebarHeader className="h-14 justify-center border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-active:bg-transparent data-active:text-foreground group-data-[collapsible=icon]:p-1.5!"
              onClick={handleSidebarClick}
              render={(renderProps) => (
                <NavLink
                  exact={true}
                  resetScroll={resetScroll}
                  to={homePath}
                  {...renderProps}
                />
              )}
            >
              <img alt="Dashboard Logo" height={24} src={logo} width={24} />
              <span className="font-bold">{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {items.map((group, index) => (
          <SidebarGroup key={`${group.label ?? "group"}-${index.toString()}`}>
            {!!group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item, itemIndex) => (
                <SidebarMenuItem key={`${item.to}-${itemIndex.toString()}`}>
                  <SidebarMenuButton
                    className={navMenuButtonClassName}
                    onClick={handleSidebarClick}
                    render={(renderProps) => (
                      <NavLink
                        exact={item.exact}
                        resetScroll={resetScroll}
                        to={item.to}
                        {...renderProps}
                      />
                    )}
                    tooltip={item.title}
                  >
                    {item.icon ?? null}
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
      {user ? (
        <SidebarFooter className="border-t">
          <NavUser signOut={signOut} user={user} />
        </SidebarFooter>
      ) : null}
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
  signOut?: () => void;
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
              <AvatarFallback className="bg-primary/15 font-semibold text-primary text-xs">
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
                <div className="flex items-center gap-2 px-1 py-1.5 text-left">
                  <Avatar>
                    <AvatarFallback className="bg-primary/15 font-semibold text-primary text-xs">
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
            {signOut ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </>
            ) : null}
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

type TopBarProps<TTo extends string = string, TId extends string = string> = {
  items: NavGroup<TTo>[];
  customTitles?: Partial<Record<TId, ReactNode>>;
};

export function TopBar<
  TTo extends string = string,
  TId extends string = string,
>({ items, customTitles }: TopBarProps<TTo, TId>) {
  const matches = useMatches();
  const currentRouteId = matches.at(-1)?.routeId;

  const activeItem = useMemo(
    () => getMatchingNavItem(currentRouteId, items),
    [items, currentRouteId]
  );
  const customTitle = useMemo(
    () => (currentRouteId ? customTitles?.[currentRouteId as TId] : undefined),
    [currentRouteId, customTitles]
  );

  return (
    <header className="sticky top-0 z-40 flex h-14 min-w-0 shrink-0 items-center gap-2 border-b bg-background/40 backdrop-blur-sm transition-[width,height] ease-linear">
      <div className="flex min-w-0 max-w-full flex-1 items-center gap-2 px-4">
        <SidebarMenuTrigger className="-ml-1" />
        <Separator
          className="my-auto mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        {customTitle ? customTitle : null}
        {!customTitle && activeItem?.title ? (
          <p className="font-bold">{activeItem.title}</p>
        ) : null}
      </div>
    </header>
  );
}

type DashboardProps<
  TTo extends string = string,
  TId extends string = string,
> = AppSidebarProps<TTo> & {
  children: ReactNode;
  mainClassName?: string;
  sideBarClassName?: string;
  className?: string;
  customTitles?: Partial<Record<TId, ReactNode>>;
};

export function Dashboard<
  TTo extends string = string,
  TId extends string = string,
>({
  children,
  mainClassName,
  sideBarClassName,
  className,
  items,
  customTitles,
  ...props
}: DashboardProps<TTo, TId>) {
  return (
    <SidebarProvider className="min-h-svh">
      <AppSidebar className={sideBarClassName} items={items} {...props} />
      <main
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col has-data-disable-dashboard-scroll:max-h-dvh",
          mainClassName
        )}
      >
        <TopBar customTitles={customTitles} items={items} />
        <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
