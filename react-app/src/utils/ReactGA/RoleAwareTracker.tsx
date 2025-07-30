// src/components/RoleAwareTracker.tsx
import { useEffect, useState } from "react";
import { isCmsUser, isStateUser } from "shared-utils";
import { useGetUser } from "@/api";
const { data: userObj } = useGetUser();
import PathTracker from "./PathTracker"; // adjust path if needed

type UserRole = "cms" | "state";

function setGAUserRoleOnce(role: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  // Prevent setting it multiple times
  if (window.__gaUserRoleSet) return;
  window.gtag("set", { user_role: role });
  window.__gaUserRoleSet = true; // Custom flag on window to track setting
}

/**
 * RoleAwareTracker
 *
 * 1) Reads the Cognito userData blob from Local Storage.
 * 2) Extracts either "custom:cms-roles" or "custom:ismemberof".
 * 3) Maps that attribute string into either "state" or "cms".
 */
export function RoleAwareTracker({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  useEffect(() => {
    // 1) Find the Local Storage key that contains "CognitoIdentityServiceProvider.*.userData"
    const allKeys = Object.keys(localStorage);
    const userDataKey = allKeys.find(
      (k) => k.endsWith(".userData") && k.startsWith("CognitoIdentityServiceProvider."),
    );

    if (!userDataKey) {
      // No userData in localStorage or not logged in yet.t.
      return;
    }

    try {
      let role: UserRole | null = null;
      if (isCmsUser(userObj.user)) {
        role = "cms";
      } else if (isStateUser(userObj.user)) {
        role = "state";
      } 
      if (role) {
        setUserRole(role);
        setGAUserRoleOnce(role);
      }
    } catch (e) {
      console.log("error obtaining user roles for path tracking", e);
      // If parsing fails for or roles dont exist yet (initial page load before login)
      setUserRole("state");
    }
  }, []);
  return <PathTracker userRole={userRole}>{children}</PathTracker>;
}
