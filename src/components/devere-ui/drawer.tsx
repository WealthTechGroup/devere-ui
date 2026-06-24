import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { type ComponentProps, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

type DrawerDirection = "top" | "right" | "bottom" | "left";

const DrawerContext = createContext(true);

const drawerPopupClassName =
  "group/drawer-content data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(100%+2px))] data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(-100%-2px))] data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(100%+2px))] data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(-100%-2px))] data-starting-style:data-[swipe-direction=down]:transform-[translateY(calc(100%+2px))] data-starting-style:data-[swipe-direction=left]:transform-[translateX(calc(-100%-2px))] data-starting-style:data-[swipe-direction=right]:transform-[translateX(calc(100%+2px))] data-starting-style:data-[swipe-direction=up]:transform-[translateY(calc(-100%-2px))] data-[swipe-direction=down]:transform-[translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] data-[swipe-direction=left]:transform-[translateX(var(--drawer-swipe-movement-x))] data-[swipe-direction=right]:transform-[translateX(var(--drawer-swipe-movement-x))] data-[swipe-direction=up]:transform-[translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] pointer-events-auto fixed z-50 flex h-full flex-col bg-transparent text-sm outline-none transition-transform duration-200 data-[swipe-direction=down]:pb-[max(0px,calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] data-[swipe-direction=down]:inset-x-2 data-[swipe-direction=up]:inset-x-2 data-[swipe-direction=left]:inset-y-2 data-[swipe-direction=right]:inset-y-2 data-[swipe-direction=up]:top-2 data-[swipe-direction=right]:right-2 data-[swipe-direction=down]:bottom-2 data-[swipe-direction=left]:left-2 max-h-[calc(100vh-16px)] data-[swipe-direction=left]:w-3/4 data-[swipe-direction=right]:w-3/4 data-starting-style:data-[swipe-direction=down]:pb-0 data-ending-style:data-[swipe-direction=down]:pb-0 data-swiping:duration-0 data-[swipe-direction=left]:sm:max-w-sm data-[swipe-direction=right]:sm:max-w-sm";

const RESIZABLE_SNAP_POINTS = Array.from(
  { length: 91 },
  (_, i) => (i + 10) / 100
);

const directionToSwipeDirection = {
  top: "up",
  right: "right",
  bottom: "down",
  left: "left",
} as const satisfies Record<
  DrawerDirection,
  DrawerPrimitive.Root.Props["swipeDirection"]
>;

type DrawerProps = Omit<DrawerPrimitive.Root.Props, "swipeDirection"> & {
  direction?: DrawerDirection;
  swipeDirection?: DrawerPrimitive.Root.Props["swipeDirection"];
  resizable?: boolean;
};

function Drawer({
  direction = "bottom",
  swipeDirection,
  modal = true,
  resizable = true,
  snapPoints,
  ...props
}: DrawerProps) {
  const drawerSnapPoints =
    snapPoints ?? (resizable ? RESIZABLE_SNAP_POINTS : undefined);

  return (
    <DrawerContext.Provider value={modal === true}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        modal={modal}
        snapPoints={drawerSnapPoints}
        swipeDirection={swipeDirection ?? directionToSwipeDirection[direction]}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/30 opacity-100 backdrop-blur-sm transition-[opacity,backdrop-filter] duration-200 data-closed:opacity-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-closed:backdrop-blur-none data-ending-style:backdrop-blur-none data-starting-style:backdrop-blur-none",
        className
      )}
      data-slot="drawer-overlay"
      {...props}
    />
  );
}

function DrawerViewport({
  className,
  ...props
}: DrawerPrimitive.Viewport.Props) {
  return (
    <DrawerPrimitive.Viewport
      className={cn("pointer-events-none fixed inset-0 z-50", className)}
      data-slot="drawer-viewport"
      {...props}
    />
  );
}

function DrawerHandle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "hidden w-full shrink-0 touch-none select-none active:cursor-grabbing group-data-[swipe-direction=down]/drawer-content:flex group-data-[swipe-direction=down]/drawer-content:cursor-grab group-data-swiping/drawer-content:cursor-grabbing group-data-[swipe-direction=down]/drawer-content:justify-center group-data-[swipe-direction=down]/drawer-content:px-4 group-data-[swipe-direction=down]/drawer-content:pt-4 group-data-[swipe-direction=down]/drawer-content:pb-2",
        className
      )}
      data-slot="drawer-handle"
      {...props}
    >
      <div
        aria-hidden
        className="h-1.5 w-[100px] shrink-0 rounded-full bg-muted"
      />
    </div>
  );
}

function DrawerContent({
  className,
  children,
  showHandle = true,
  showOverlay,
  ...props
}: DrawerPrimitive.Popup.Props & {
  showHandle?: boolean;
  showOverlay?: boolean;
}) {
  const isModal = useContext(DrawerContext);
  const shouldShowOverlay = showOverlay ?? isModal;

  return (
    <DrawerPortal>
      {shouldShowOverlay ? <DrawerOverlay /> : null}
      <DrawerViewport>
        <DrawerPrimitive.Popup
          className={cn(drawerPopupClassName, className)}
          data-slot="drawer-content"
          {...props}
        >
          <div className="flex min-h-0 flex-1 flex-col rounded-4xl border border-border bg-popover text-popover-foreground shadow-xl">
            {showHandle && <DrawerHandle />}
            <DrawerPrimitive.Content className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </DrawerPrimitive.Content>
          </div>
        </DrawerPrimitive.Popup>
      </DrawerViewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[swipe-direction=down]/drawer-content:text-center group-data-[swipe-direction=up]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      data-slot="drawer-header"
      {...props}
    />
  );
}

function DrawerBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4",
        className
      )}
      data-slot="drawer-body"
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      data-slot="drawer-footer"
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      className={cn(
        "font-heading font-medium text-base text-foreground",
        className
      )}
      data-slot="drawer-title"
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="drawer-description"
      {...props}
    />
  );
}

export type { DrawerDirection, DrawerProps };
export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
};
