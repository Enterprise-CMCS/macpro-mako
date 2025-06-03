// src/components/RoleAwareTracker.tsx
import { useEffect, useState } from "react";
import  PathTracker  from "./PathTracker"; // adjust path if needed
import * as C from "@/components";            // so we can render <C.Layout />

type UserRole = "cms" | "state";

/**
 * RoleAwareTracker
 *
 * 1) Reads the Cognito userData blob from Local Storage.
 * 2) Extracts either "custom:cms-roles" or "custom:ismemberof".
 * 3) Maps that attribute string into either "state" or "cms".
 * 4) Once known, renders <PathTracker userRole=...><C.Layout /></PathTracker>.
 *
 * While it’s figuring out the role, you can render null or a loading indicator.
 */
export function RoleAwareTracker({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // 1) Find the Local Storage key that contains "CognitoIdentityServiceProvider.*.userData"
    // We don’t know the full prefix, so scan all keys for ".userData" suffix.
    const allKeys = Object.keys(localStorage);
    const userDataKey = allKeys.find((k) =>
      k.endsWith(".userData") &&
      k.startsWith("CognitoIdentityServiceProvider.")
    );

    if (!userDataKey) {
      // No userData in localStorage → maybe not logged in yet.
      // You could set a default, or do nothing until login populates it.
      return;
    }

    try {
      const raw = localStorage.getItem(userDataKey);
      if (!raw) {
        return;
      }
      const obj = JSON.parse(raw);
      /**
       * The structure is:
       *   {
       *     UserAttributes: [
       *       { Name: "email", Value: "..." },
       *       { Name: "custom:cms-roles", Value: "onemac-state-user" },
       *       … etc …
       *     ],
       *     Username: "..."
       *   }
       */
      const attrs: { Name: string; Value: string }[] = obj.UserAttributes || [];

      // 2) Try to find either "custom:cms-roles" or fallback to "custom:ismemberof"
      const cmsRolesAttr = attrs.find((a) => a.Name === "custom:cms-roles");
      const isMemberOfAttr = attrs.find((a) => a.Name === "custom:ismemberof");

      // Pick whichever exists; if both exist, prefer custom:cms-roles
      const rawRoleString = cmsRolesAttr
        ? cmsRolesAttr.Value
        : isMemberOfAttr
        ? isMemberOfAttr.Value
        : "";

      // 3) Now map rawRoleString into either "state" or "cms"
      //    We look for any of the “state” keys in that comma-separated list:
      const stateKeywords = new Set([
        "statesubmitter",
        "statesystemadmin",
        "norole",
        "onemac-state-user",
      ]);

      //    And the “cms” keys:
      const cmsKeywords = new Set([
        "cmsroleapprover",
        "cmsreviewer",
        "helpdesk",
        "onemac-helpdesk",
        "defaultcmsuser",
        "ONEMAC_USER_D",
        "onemac-micro-readonly",
        "ONEMAC_USER_D_SUPER",
      ]);

      // Split the rawRoleString by commas (e.g. "onemac-state-user,foo") and trim
      const candidates = rawRoleString.split(",").map((s: string) => s.trim());

      // Decide if we see any state-keyword
      const isState = candidates.some((c) => stateKeywords.has(c));
      const isCMS = candidates.some((c) => cmsKeywords.has(c));

      if (isState && !isCMS) {
        setUserRole("state");
      } else if (isCMS && !isState) {
        setUserRole("cms");
      } else if (isState && isCMS) {
        // In the rare case both match, default to whichever you prefer.
        setUserRole("cms");
      } else {
        // If no keywords match, you could default to “state” or “cms”, or leave null.
        setUserRole(null);
      }
    } catch (e) {
      console.error("Error parsing userData from LocalStorage", e);
      // If parsing fails for any reason, default or stay null:
      setUserRole("state");
    }
  }, []);

  // Until we know userRole, we render nothing (or a spinner). Once we have it, mount PathTracker.


  return <PathTracker userRole={userRole}>{children}</PathTracker>;
}
