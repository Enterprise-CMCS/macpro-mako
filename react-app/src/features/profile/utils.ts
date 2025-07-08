import { UserRole } from "shared-types/events/legacy-user";

import { StateAccess } from "@/api";
import { convertStateAbbrToFullName } from "@/utils";

// TODO: rename? all roles should see either a State or Status Access Card
export const stateAccessRoles: UserRole[] = [
  "statesubmitter",
  "statesystemadmin",
  "cmsroleapprover",
  "helpdesk",
  "defaultcmsuser",
  "cmsreviewer",
  "norole",
];

// In the backend we named the prop "StateAcess", but this is used for both state and CMS users
// it is confusing me so on the frontend we will convert StateAcess -> RoleStatus as that is the more appropriate name

export const orderRoleStatus = (accesses: StateAccess[]) => {
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
export const filterRoleStatus = (userDetails, userProfile) => {
  if (!userProfile?.stateAccess || userProfile.stateAccess.length < 1) return [];
  return userDetails?.role && userDetails?.role !== "norole"
    ? userProfile.stateAccess.filter((access: StateAccess) => access.role === userDetails.role)
    : userProfile.stateAccess;
};

export const hasPendingRequests = (stateAccess) => {
  if (!stateAccess || stateAccess.length < 1) return false;
  return stateAccess.some((role) => role.status === "pending");
};
