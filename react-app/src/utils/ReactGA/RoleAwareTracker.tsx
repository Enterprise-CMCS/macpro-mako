// src/components/RoleAwareTracker.tsx
import { useEffect, useState } from "react";
import { isCmsUser, isStateUser } from "shared-utils";

import PathTracker from "./PathTracker"; // adjust path if needed

type UserRole = "cms" | "state";

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
      // No userData in localStorage → maybe not logged in yet.
      // You could set a default, or do nothing until login populates it.
      return;
    }

    try {
      // const raw = localStorage.getItem(userDataKey);
      // if (!raw) {
      //   return;
      // }
      // const obj = JSON.parse(raw);
      // const attrs: { Name: string; Value: string }[] = obj.UserAttributes || [];

      // // 2) Try to find either "custom:cms-roles" or fallback to "custom:ismemberof"
      // const cmsRolesAttr = attrs.find((a) => a.Name === "custom:cms-roles");
      // const isMemberOfAttr = attrs.find((a) => a.Name === "custom:ismemberof");

      // // Pick whichever exists but if both exist, prefer custom:cms-roles
      // // TODO: determine if both esist in production and if so which takes priority
      // const rawRoleString = cmsRolesAttr
      //   ? cmsRolesAttr.Value
      //   : isMemberOfAttr
      //   ? isMemberOfAttr.Value
      //   : "";

      // // state specific roles
      // const stateKeywords = new Set([
      //   "statesubmitter",
      //   "statesystemadmin",
      //   "norole",
      //   "onemac-state-user",
      // ]);

      // // cms specific roles
      // const cmsKeywords = new Set([
      //   "cmsroleapprover",
      //   "cmsreviewer",
      //   "helpdesk",
      //   "onemac-helpdesk",
      //   "defaultcmsuser",
      //   "ONEMAC_USER_D",
      //   "onemac-micro-readonly",
      //   "ONEMAC_USER_D_SUPER",
      // ]);

      // // Split the rawRoleString and extract the role
      // const candidates = rawRoleString.split(",").map((s: string) => s.trim());

      // const isState = candidates.some((c) => stateKeywords.has(c));
      // const isCMS = candidates.some((c) => cmsKeywords.has(c));

      if (isStateUser && !isCmsUser) {
        setUserRole("state");
      } else if (isCmsUser && !isStateUser) {
        setUserRole("cms");
      } else if (isStateUser && isCmsUser) {
        // should never happen
        setUserRole("cms");
      } else {
        setUserRole(null);
      }
    } catch (e) {
      console.log("error obtaining user roles for path tracking", e)
      // If parsing fails for or roles dont exist yet (initial page load before login)
      setUserRole("state");
    }
  }, []);
  return <PathTracker userRole={userRole}>{children}</PathTracker>;
}
