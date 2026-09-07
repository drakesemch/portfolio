import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { type ComponentProps, createContext, use } from "react";
import { cn } from "@/lib/utils";

function resolveClassName<S>(
  className: string | ((state: S) => string | undefined) | undefined,
  state: S,
): string | undefined {
  return typeof className === "function" ? className(state) : className;
}

const DrawerContext =
  createContext<DrawerPrimitive.Root.Props["swipeDirection"]>("down");

function DrawerProvider({ ...props }: DrawerPrimitive.Provider.Props) {
  return <DrawerPrimitive.Provider {...props} />;
}

function Drawer({
  swipeDirection = "down",
  ...props
}: DrawerPrimitive.Root.Props) {
  return (
    <DrawerContext value={swipeDirection}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        swipeDirection={swipeDirection}
        {...props}
      />
    </DrawerContext>
  );
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger {...props} data-slot="drawer-trigger" />;
}

function DrawerPortal({ className, ...props }: DrawerPrimitive.Portal.Props) {
  return (
    <DrawerPrimitive.Portal
      data-slot="drawer-portal"
      className={(state) => cn("z-50!", resolveClassName(className, state))}
      {...props}
    />
  );
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerContent({ className, ...props }: DrawerPrimitive.Content.Props) {
  return (
    <DrawerPrimitive.Content
      data-slot="drawer-content"
      className={(state) =>
        cn(
          "transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100",
          resolveClassName(className, state),
        )
      }
      {...props}
    />
  );
}

export const drawerPopupClassName = ({
  swipeDirection,
}: DrawerPrimitive.Popup.State) => {
  return cn(
    "group/popup relative",
    "touch-auto overflow-y-auto overscroll-contain bg-background text-foreground outline-1 outline-foreground/5 [--bleed:3rem] data-swiping:select-none dark:outline-border",
    "data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
    // Nested drawer stacking variables (no-ops when not nested)
    "[--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))-var(--bleed)))] [--peek:1rem] [--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))] [--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--shrink:calc(1-var(--scale))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-step:0.05]",
    // Nested drawer overlay (::after pseudo-element)
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-transparent after:transition-[background-color] after:duration-450 after:ease-[cubic-bezier(0.32,0.72,0,1)] after:content-['']",
    // Nested drawer states
    "data-nested-drawer-open:overflow-hidden data-nested-drawer-swiping:duration-0 data-nested-drawer-open:after:bg-black/5",
    {
      // Shared horizontal (left & right)
      "h-full w-[calc(22rem+var(--bleed))] max-w-[calc(100vw-3rem+var(--bleed))] p-6 supports-[-webkit-touch-callout:none]:w-[20rem] supports-[-webkit-touch-callout:none]:max-w-[calc(100vw-20px)] supports-[-webkit-touch-callout:none]:rounded-[10px] supports-[-webkit-touch-callout:none]:[--bleed:0px]":
        swipeDirection === "left" || swipeDirection === "right",
      // Right-only (with stacking transform + transition for box-shadow)
      "transform-[translateX(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--shrink)*100%)))_scale(var(--scale))] -mr-(--bleed) origin-[calc(100%-var(--bleed))_50%] rounded-l-2xl pr-[calc(1.5rem+var(--bleed))] shadow-[-2px_0_10px_rgb(0_0_0/0.1)] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)] data-ending-style:shadow-[-2px_0_10px_rgb(0_0_0/0)] data-swiping:duration-0 supports-[-webkit-touch-callout:none]:mr-0 supports-[-webkit-touch-callout:none]:pr-6":
        swipeDirection === "right",
      // Left-only (with stacking transform + transition for box-shadow)
      "transform-[translateX(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--shrink)*100%)))_scale(var(--scale))] -ml-(--bleed) origin-[var(--bleed)_50%] rounded-r-2xl pl-[calc(1.5rem+var(--bleed))] shadow-[2px_0_10px_rgb(0_0_0/0.1)] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)] data-ending-style:shadow-[2px_0_10px_rgb(0_0_0/0)] data-swiping:duration-0 supports-[-webkit-touch-callout:none]:ml-0 supports-[-webkit-touch-callout:none]:pl-6":
        swipeDirection === "left",
      // Right enter/exit
      "data-ending-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)))] data-starting-style:transform-[translateX(calc(100%-var(--bleed)+var(--viewport-padding)))]":
        swipeDirection === "right",
      // Left enter/exit
      "data-ending-style:transform-[translateX(calc(-100%+var(--bleed)-var(--viewport-padding)))] data-starting-style:transform-[translateX(calc(-100%+var(--bleed)-var(--viewport-padding)))]":
        swipeDirection === "left",
      // Shared vertical (up & down)
      "max-h-[calc(80vh+var(--bleed))] w-full px-6":
        swipeDirection === "up" || swipeDirection === "down",
      // Down-only (with stacking transform + transitions for height & box-shadow)
      "transform-[translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))] -mb-(--bleed) h-(--drawer-height,auto) origin-[50%_calc(100%-var(--bleed))] rounded-t-2xl pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+var(--bleed))] shadow-[0_2px_10px_rgb(0_0_0/0.1)] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),height_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)] data-nested-drawer-open:h-[calc(var(--height)+var(--bleed))] data-ending-style:shadow-[0_2px_10px_rgb(0_0_0/0)] data-swiping:duration-0":
        swipeDirection === "down",
      // Up-only (with stacking transform + transitions for height & box-shadow)
      "transform-[translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--shrink)*var(--height))))_scale(var(--scale))] -mt-(--bleed) h-(--drawer-height,auto) origin-[50%_var(--bleed)] rounded-b-2xl pt-[calc(1.5rem+env(safe-area-inset-top,0px)+var(--bleed))] pb-6 shadow-[0_-2px_10px_rgb(0_0_0/0.1)] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),height_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)] data-nested-drawer-open:h-[calc(var(--height)+var(--bleed))] data-ending-style:shadow-[0_-2px_10px_rgb(0_0_0/0)] data-swiping:duration-0":
        swipeDirection === "up",
      // Down enter/exit
      "data-ending-style:transform-[translateY(calc(100%-var(--bleed)))] data-starting-style:transform-[translateY(calc(100%-var(--bleed)))]":
        swipeDirection === "down",
      // Up enter/exit
      "data-ending-style:transform-[translateY(calc(-100%+var(--bleed)))] data-starting-style:transform-[translateY(calc(-100%+var(--bleed)))]":
        swipeDirection === "up",
    },
  );
};

function DrawerPopup({
  className,
  children,
  container,
  modal = true,
  forceRenderBackdrop = true,
  ...props
}: DrawerPrimitive.Popup.Props & {
  container?: DrawerPrimitive.Portal.Props["container"];
  modal?: boolean;
  forceRenderBackdrop?: boolean;
}) {
  return (
    <DrawerPortal container={container}>
      {modal && <DrawerBackdrop forceRender={forceRenderBackdrop} />}
      <DrawerViewport>
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          className={(state) =>
            cn(drawerPopupClassName(state), resolveClassName(className, state))
          }
          {...props}
        >
          {children}
        </DrawerPrimitive.Popup>
      </DrawerViewport>
    </DrawerPortal>
  );
}

function DrawerHandle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto h-1 w-24 shrink-0 rounded-full bg-muted transition-opacity duration-200 group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function DrawerViewport({
  className,
  ...props
}: DrawerPrimitive.Viewport.Props) {
  const dir = use(DrawerContext);
  return (
    <DrawerPrimitive.Viewport
      data-slot="drawer-viewport"
      className={(state) =>
        cn(
          "fixed inset-0 z-100 flex",
          {
            "items-stretch p-(--viewport-padding) [--viewport-padding:0px] supports-[-webkit-touch-callout:none]:[--viewport-padding:0.625rem]":
              dir === "left" || dir === "right",
            "justify-end": dir === "right",
            "justify-start": dir === "left",
            "items-end justify-center": dir === "down",
            "items-start justify-center": dir === "up",
          },
          resolveClassName(className, state),
        )
      }
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  const dir = use(DrawerContext);

  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={(state) =>
        cn(
          "font-medium text-base text-foreground",
          {
            "text-center": dir === "down" || dir === "up",
          },
          resolveClassName(className, state),
        )
      }
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  const dir = use(DrawerContext);

  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={(state) =>
        cn(
          "mt-1.5 text-muted-foreground text-sm",
          {
            "text-center": dir === "down" || dir === "up",
          },
          resolveClassName(className, state),
        )
      }
      {...props}
    />
  );
}

function DrawerBackdrop({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-backdrop"
      className={(state) =>
        cn(
          "fixed inset-0 z-40 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-all duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.2] [--bleed:3rem] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute dark:[--backdrop-opacity:0.7]",
          "backdrop-blur-[calc(4rem*(1-var(--drawer-swipe-progress)))]",
          resolveClassName(className, state),
        )
      }
      {...props}
    />
  );
}

function DrawerIndentBackground({
  className,
  ...props
}: DrawerPrimitive.IndentBackground.Props) {
  return (
    <DrawerPrimitive.IndentBackground
      data-slot="drawer-indent-background"
      className={(state) =>
        cn(
          "absolute inset-0 isolate bg-foreground/70",
          resolveClassName(className, state),
        )
      }
      {...props}
    />
  );
}

function DrawerIndent({ className, ...props }: DrawerPrimitive.Indent.Props) {
  return (
    <DrawerPrimitive.Indent
      className={(state) =>
        cn(
          "transform-[scale(1)_translateY(0)] data-active:transform-[scale(calc(0.98+(0.02*var(--indent-progress))))_translateY(calc(0.5rem*(1-var(--indent-progress))))] relative origin-[center_top] border bg-background p-4 duration-[calc(400ms*var(--indent-transition)),calc(250ms*var(--indent-transition))] will-change-transform [--indent-progress:var(--drawer-swipe-progress)] [--indent-radius:calc(1rem*(1-var(--indent-progress)))] [--indent-transition:calc(1-clamp(0,calc(var(--drawer-swipe-progress)*100000),1))] [transition:transform_0.4s_cubic-bezier(0.32,0.72,0,1),border-radius_0.25s_cubic-bezier(0.32,0.72,0,1)] data-active:rounded-tl-(--indent-radius) data-active:rounded-tr-(--indent-radius)",
          resolveClassName(className, state),
        )
      }
      {...props}
    />
  );
}

export {
  DrawerProvider,
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerPopup,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
  DrawerIndentBackground,
  DrawerIndent,
  DrawerHandle,
};
