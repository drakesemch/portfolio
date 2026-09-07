// src/components/router-progress-bar.tsx

import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";

export function RouterProgressBar() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isLoading) {
      setVisible(true);
      setProgress(10);
      requestAnimationFrame(() => setOpacity(1));

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          return prev + Math.random() * 10;
        });
      }, 300);
    } else {
      setProgress(100);
      const fadeOut = setTimeout(() => setOpacity(0), 100);
      const unmount = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 500);
      return () => {
        clearTimeout(fadeOut);
        clearTimeout(unmount);
      };
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 right-0 left-0 z-50 h-0.5 transition-opacity duration-300 ease-in-out"
      style={{ opacity, viewTransitionName: "progress-bar" }}
    >
      <Progress
        value={progress}
        className="h-full w-full rounded-none bg-transparent *:h-full *:transition-all *:duration-100 *:ease-in-out"
      >
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
