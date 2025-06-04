// src/components/PathTracker.tsx
import { useEffect, useRef } from "react";

type PathTrackerProps = {
  userRole: "cms" | "state";
  children: React.ReactNode;
};

/**
 * Wrap this around your <C.Layout> (or wherever your <Outlet> lives).
 * It will send:
 *   • a `custom_page_view` event on initial mount + every route change
 *   • a `page_duration` event when the user leaves the previous route
 */
export default function PathTracker({ userRole, children }: PathTrackerProps) {
  // keep track of the "last path" so we only send once per change
  const prevPathRef = useRef<string>(window.location.pathname);

  // record when the current route was "entered"
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // ── Helper #1: send a `custom_page_view` to GA
    const sendPageView = (path: string) => {
      if (userRole) {
        window.gtag?.("event", "custom_page_view", {
          page_path: path,
          user_role: userRole,
        });
      }
    };

    // ── Helper #2: send a `page_duration` to GA
    //    timeOnPage is rounded to nearest second.
    const sendPageDuration = (path: string, startTs: number) => {
      if (userRole) {
        const now = Date.now();
        const deltaMs = now - startTs;
        const timeOnPageSec = Math.round(deltaMs / 1000); // nearest second

        window.gtag?.("event", "page_duration", {
          page_path: path,
          user_role: userRole,
          time_on_page_sec: timeOnPageSec,
        });
      }
    };

    // ── ON INITIAL MOUNT: 
    //    • send page_view for the first load
    //    • startTimeRef is already set to Date.now() by default
    sendPageView(window.location.pathname);

    // ── Called whenever we detect a route change:
    const onRouteChange = () => {
      const newPath = window.location.pathname;
      const oldPath = prevPathRef.current;

      // if the path didn’t actually change, do nothing
      if (newPath === oldPath) {
        return;
      }

      // 1) send page_duration for the *old* path
      sendPageDuration(oldPath, startTimeRef.current);

      // 2) update prevPath and reset startTime for the new page
      prevPathRef.current = newPath;
      startTimeRef.current = Date.now();

      // 3) finally, send a new page_view for the new path
      sendPageView(newPath);
    };

    // ── Monkey‐patch pushState/replaceState so we catch in‐app navigation
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;

    window.history.pushState = function (this: History, ...args: any[]) {
      origPush.apply(this, args);
      onRouteChange();
    };
    window.history.replaceState = function (this: History, ...args: any[]) {
      origReplace.apply(this, args);
      onRouteChange();
    };

    // ── Also catch Back/Forward buttons
    window.addEventListener("popstate", onRouteChange);

    // ── CLEANUP: when PathTracker unmounts (i.e. user leaves the app or hot-reloads)
    return () => {
      // 1) send duration for whichever page we were on
      sendPageDuration(prevPathRef.current, startTimeRef.current);

      // 2) restore history methods and remove listener
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener("popstate", onRouteChange);
    };
  }, [userRole]);

  // Render children as usual
  return <>{children}</>;
}
