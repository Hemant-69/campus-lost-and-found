"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function NavigationTracker({
  onRouteStart,
  onRouteEnd,
}: {
  onRouteStart: () => void;
  onRouteEnd: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialLoadRef = useRef(true);

  // When pathname or search params update, complete the navigation progress
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    onRouteEnd();
  }, [pathname, searchParams, onRouteEnd]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore modified clicks (Ctrl, Cmd, Shift, Alt, middle-click)
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      // Check if internal URL
      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (targetUrl.origin !== currentUrl.origin) {
          return;
        }

        // If target matches current pathname + search, do not start navigation progress
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search
        ) {
          return;
        }

        onRouteStart();
      } catch {
        // invalid URL, ignore
      }
    };

    const handlePopState = () => {
      onRouteStart();
    };

    const handleCustomStart = () => onRouteStart();
    const handleCustomEnd = () => onRouteEnd();

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("campus:nav-start", handleCustomStart);
    window.addEventListener("campus:nav-end", handleCustomEnd);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("campus:nav-start", handleCustomStart);
      window.removeEventListener("campus:nav-end", handleCustomEnd);
    };
  }, [onRouteStart, onRouteEnd]);

  return null;
}

export function NavigationProgressBar() {
  const [status, setStatus] = useState<"idle" | "loading" | "finishing">("idle");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleStart = React.useCallback(() => {
    cleanup();
    setStatus("loading");
    setProgress(25);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          return prev;
        }
        const step = Math.max(1, (85 - prev) * 0.15);
        return Math.min(85, prev + step);
      });
    }, 150);

    // Safety timeout in case navigation takes too long or cancels
    timeoutRef.current = setTimeout(() => {
      handleEnd();
    }, 8000);
  }, []);

  const handleEnd = React.useCallback(() => {
    cleanup();
    setProgress(100);
    setStatus("finishing");

    timeoutRef.current = setTimeout(() => {
      setStatus("idle");
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    return cleanup;
  }, []);

  if (status === "idle") {
    return (
      <Suspense fallback={null}>
        <NavigationTracker onRouteStart={handleStart} onRouteEnd={handleEnd} />
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <NavigationTracker onRouteStart={handleStart} onRouteEnd={handleEnd} />
      </Suspense>

      {/* Top Progress Line */}
      <div
        className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-all duration-300 ease-out"
        style={{
          height: "3.5px",
          opacity: status === "finishing" ? 0 : 1,
        }}
      >
        <div
          className="h-full bg-coral transition-all duration-200 ease-out shadow-[0_0_8px_#D9482B,0_0_4px_#F2B84B]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Notice Pill Spinner */}
      <div
        className="fixed top-3 right-4 z-[99999] pointer-events-none transition-opacity duration-200"
        style={{
          opacity: status === "loading" ? 1 : 0,
        }}
      >
        <div className="bg-paper border-2 border-ink rounded-full px-3 py-1 shadow-hard-btn flex items-center gap-2 text-xs font-bold text-ink">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-coral stroke-[3]" />
          <span>Loading notice...</span>
        </div>
      </div>
    </>
  );
}
