import { useEffect, useRef } from "react";

type PathTrackerProps = {
  userRole: "cms" | "state";
  children: React.ReactNode;
};

/**
 * Wrap around your <C.Layout>.
 * It will send:
 *   1) a `custom_page_view` event on initial mount or after every route change
 *   2) a `page_duration` event when the user leaves the previous route
 */
export default function PathTracker({ userRole, children }: PathTrackerProps) {
  // keep track of the path of the page the user is leaving
  const prevPathRef = useRef<string>(window.location.pathname);

  // record when the current route was "entered"
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    //for tracking page views
    const sendPageView = (path: string) => {
      if (userRole) {
        window.gtag?.("event", "custom_page_view", {
          page_path: path,
          user_role: userRole,
        });
      }
    };

    //for tracking duration spent on page
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

    // send page_view for the first load
    sendPageView(window.location.pathname);

    // when a route change is detected
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

    //Also catch Back/Forward buttons
    window.addEventListener("popstate", onRouteChange);

    //cleanup- when PathTracker unmounts (i.e. user leaves the app or hot-reloads)
    return () => {
      //send duration for whichever page user was on
      sendPageDuration(prevPathRef.current, startTimeRef.current);

      //restore history methods and remove listener
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener("popstate", onRouteChange);
    };
  }, [userRole]);

  // Render children as usual
  return <>{children}</>;
}
