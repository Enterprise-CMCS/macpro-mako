// src/components/PathTracker.tsx
import { useEffect, useRef } from "react";

type PathTrackerProps = {
  userRole: "cms" | "state";     // adjust if you have a different way of determining role
  children: React.ReactNode;
};

/**
 * Wrap this around your <C.Layout> (or wherever your <Outlet> lives).
 * It will send a `page_view` event to GA whenever window.location.pathname changes.
 */
export default function PathTracker({ userRole, children }: PathTrackerProps) {
  // We keep track of the "last path" so we only send once per change
  const prevPathRef = useRef<string>(window.location.pathname);

  useEffect(() => {
    // Helper to send a `page_view` to GA
    const sendPageView = (path: string) => {
    if(userRole) {
        console.log("********** has role: " + userRole + " Sending ROUTE CHANGE GA EVENT **********")
        console.log("*********** PAGE PATH: " + path + " *****************")
        window.gtag?.("event", "custom_page_view", {
            page_path: path,
            user_role: userRole,
        });
    }
    };

    // Call once on initial mount:
    sendPageView(window.location.pathname);

    // Called whenever we detect a route change via pushState/replaceState/popstate
    const onRouteChange = () => {
      console.log("*************** Route Change ****************");
      const newPath = window.location.pathname;
      if (newPath === prevPathRef.current) return;
      prevPathRef.current = newPath;
      sendPageView(newPath);
    };

    // Monkey‐patch pushState & replaceState so we catch in‐app navigation:
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

    // Also catch Back/Forward buttons:
    window.addEventListener("popstate", onRouteChange);

    // Cleanup: restore history methods and remove listener
    return () => {
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener("popstate", onRouteChange);
    };
  }, [userRole]);

  // Just render the child routes/layout as usual
  return <>{children}</>;
}
