import type { HistoryAction, HistoryLocation } from "@tanstack/history";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

type NavigationDirection = "forward" | "backward" | "none";

const NAVIGATION_DIRECTION_ATTR = "data-navigation-direction";
let nextNavigationDirection: NavigationDirection | undefined;

export function setNextNavigationDirection(direction: NavigationDirection) {
  nextNavigationDirection = direction;
}

function getPathDepth(pathname: string) {
  return pathname.split("/").filter(Boolean).length;
}

function getNavigationDirection(
  fromLocation: HistoryLocation,
  toLocation: HistoryLocation,
  action: { type: HistoryAction; index?: number },
): NavigationDirection {
  if (nextNavigationDirection) {
    const direction = nextNavigationDirection;
    nextNavigationDirection = undefined;
    return direction;
  }

  switch (action.type) {
    case "BACK":
      return "backward";
    case "FORWARD":
      return "forward";
    case "GO":
      return typeof action.index === "number" && action.index < 0
        ? "backward"
        : "forward";
    case "PUSH":
    case "REPLACE": {
      const fromDepth = getPathDepth(fromLocation.pathname);
      const toDepth = getPathDepth(toLocation.pathname);

      if (toDepth < fromDepth) return "backward";
      return "forward";
    }
  }
}

export function NavigationViewTransitions() {
  const router = useRouter();
  const previousLocationRef = useRef<HistoryLocation | null>(null);

  useEffect(() => {
    previousLocationRef.current = router.history.location;

    return router.history.subscribe(({ location, action }) => {
      if (!previousLocationRef.current) {
        previousLocationRef.current = location;
        return;
      }

      const direction = getNavigationDirection(
        previousLocationRef.current,
        location,
        action,
      );

      previousLocationRef.current = location;
      document.documentElement.setAttribute(
        NAVIGATION_DIRECTION_ATTR,
        direction,
      );
    });
  }, [router]);

  return null;
}
