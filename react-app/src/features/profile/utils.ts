import { UserRole } from "shared-types/events/legacy-user";

import { StateAccess } from "@/api";
import { convertStateAbbrToFullName } from "@/utils";

export const userRoleMap = {
  defaultcmsuser: "CMS Read-only User",
  cmsroleapprover: "CMS Role Approver",
  cmsreviewer: "CMS Read-only User",
  statesystemadmin: "State System Admin",
  helpdesk: "Helpdesk",
  statesubmitter: "State Submitter",
  systemadmin: "System Admin",
};

export const stateAccessRoles: UserRole[] = [
  "statesubmitter",
  "statesystemadmin",
  "cmsroleapprover",
  "systemadmin",
];

export const orderStateAccess = (accesses: StateAccess[]) => {
  if (!accesses || !accesses.length) return;
  // sort revoked states seprately and add to
  const activeStates = accesses.filter((x: StateAccess) => x.status != "revoked");
  const revokedStates = accesses.filter((x: StateAccess) => x.status == "revoked");

  const compare = (a: StateAccess, b: StateAccess) => {
    const stateA = convertStateAbbrToFullName(a.territory);
    const stateB = convertStateAbbrToFullName(b.territory);

    if (stateA < stateB) return -1;
    if (stateA > stateB) return 1;
    return 0;
  };

  const sorted = activeStates.sort(compare).concat(revokedStates.sort(compare));

  return sorted;
};

// if user has no active roles, show pending state(s)
// show state(s) for latest active role
export const filterStateAccess = (userDetails, userProfile) => {
  if (!userProfile?.stateAccess) return [];
  return userDetails?.role
    ? userProfile.stateAccess.filter(
        (access: StateAccess) => access.role === userDetails.role && access.territory !== "ZZ",
      )
    : userProfile.stateAccess.filter((access: StateAccess) => access.territory !== "ZZ");
};
