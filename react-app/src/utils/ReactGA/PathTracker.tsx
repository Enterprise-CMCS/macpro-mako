import { useEffect, useRef, useState } from "react";
import { sendGAEvent } from "./SendGAEvent";
import { isCmsUser, isStateUser } from "shared-utils";

type PathTrackerProps = {
  userRole: "state" | "cms"; // optional if you prefer to derive only
  children: React.ReactNode;
};

export default function PathTracker({ userRole, children }: PathTrackerProps) {
  const prevPathRef = useRef<string>(window.location.pathname);
  const startTimeRef = useRef<number>(Date.now());

  const [role, setRole] = useState<"state" | "cms" | null>(null);

  // 🔹 Detect user role
  useEffect(() => {
    try {
      let detectedRole: "state" | "cms" = "state";
      if (isStateUser && !isCmsUser) {
        detectedRole = "state";
      } else if (isCmsUser && !isStateUser) {
        detectedRole = "cms";
      } else if (isStateUser && isCmsUser) {
        detectedRole = "cms";
      }
      setRole(detectedRole);
    } catch (e) {
      console.error("error obtaining user roles for path tracking", e);
      setRole("state");
    }
  }, []);

  // 🔹 Page view and duration tracking
  useEffect(() => {
    if (!role) return; // wait for role to be detected before tracking

    const sendPageView = (path: string) => {
      console.log("page_view sent with role:", role);
      sendGAEvent("custom_page_view", {
        page_path: path,
        referrer: prevPathRef.current || "",
        user_role: role,
      });
    };

    const sendPageDuration = (path: string, startTs: number) => {
      const now = Date.now();
      const deltaMs = now - startTs;
      const timeOnPageSec = Math.round(deltaMs / 1000);
      sendGAEvent("page_duration", {
        page_path: path,
        user_role: role,
        time_on_page_sec: timeOnPageSec,
      });
    };

    sendPageView(window.location.pathname);

    const onRouteChange = () => {
      const newPath = window.location.pathname;
      const oldPath = prevPathRef.current;
      if (newPath !== oldPath) {
        sendPageDuration(oldPath, startTimeRef.current);
        sendPageView(newPath);
        prevPathRef.current = newPath;
        startTimeRef.current = Date.now();
      }
    };

    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      origPush.apply(this, args);
      onRouteChange();
    };
    window.history.replaceState = function (...args) {
      origReplace.apply(this, args);
      onRouteChange();
    };

    window.addEventListener("popstate", onRouteChange);

    return () => {
      sendPageDuration(prevPathRef.current, startTimeRef.current);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener("popstate", onRouteChange);
    };
  }, [role]); // ✅ depend on state `role`

  return <>{children}</>;
}
