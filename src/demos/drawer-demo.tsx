import { PanelBottomOpenIcon, PanelRightOpenIcon } from "lucide-react";
import { Button } from "@/components/devere-ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/devere-ui/drawer";

const DRAWER_SNAP_POINTS = ["24rem", "36rem", 1];

function DrawerDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Drawer>
        <DrawerTrigger render={<Button variant="outline" />}>
          <PanelBottomOpenIcon />
          Open drawer
        </DrawerTrigger>
        <DrawerContent className="max-h-100">
          <DrawerHeader>
            <DrawerTitle>Portfolio summary</DrawerTitle>
            <DrawerDescription>
              Review your account allocation before confirming changes.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="grid gap-3 pt-0">
            <div className="rounded-3xl border bg-background p-4">
              <p className="font-medium text-sm">Balanced strategy</p>
              <p className="mt-1 text-muted-foreground text-sm">
                60% equity, 30% fixed income and 10% cash.
              </p>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button>Confirm allocation</Button>
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer defaultSnapPoint="24rem" snapPoints={DRAWER_SNAP_POINTS}>
        <DrawerTrigger render={<Button variant="outline" />}>
          <PanelBottomOpenIcon />
          Open snap drawer
        </DrawerTrigger>
        <DrawerContent className="">
          <DrawerHeader>
            <DrawerTitle>Performance insights</DrawerTitle>
            <DrawerDescription>
              Drag the handle to move between 24rem, 36rem and 100% viewport
              snap points.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="grid gap-3 pt-0">
            {[
              "Net flows increased across discretionary portfolios.",
              "Fixed income exposure was reduced after the latest review.",
              "Cash positions remain above the target range for three clients.",
              "Five accounts have pending risk-profile confirmation.",
            ].map((insight) => (
              <div
                className="rounded-3xl border bg-background p-4"
                key={insight}
              >
                <p className="font-medium text-sm">{insight}</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Use snap points to preview a compact summary, then expand the
                  drawer for more detail.
                </p>
              </div>
            ))}
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer direction="right">
        <DrawerTrigger render={<Button variant="outline" />}>
          <PanelRightOpenIcon />
          Open side drawer
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Client details</DrawerTitle>
            <DrawerDescription>
              Side drawers work by changing the shadcn-style direction prop.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export { DrawerDemo };
