import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";
import { getApprovingRole, newUserRoleMap } from "shared-utils";

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
    if (a.territory !== "N/A" && b.territory !== "N/A") {
      const stateA = convertStateAbbrToFullName(a.territory);
      const stateB = convertStateAbbrToFullName(b.territory);

      if (stateA < stateB) return -1;
      if (stateA > stateB) return 1;
      return 0;
    }
    if (a.role === "defaultcmsuser") return 1;
    if (b.role === "defaultcmsuser") return -1;
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

/* 

  CMS pending -

  dialogTitle: "Withdraw Role Request?",
  dialogBody: "This role is still pending approval. Withdrawing it will cancel your request.",
  ariaLabelledBy: "Self Withdraw Pending Access Modal",
  acceptButtonText: "Withdraw request" 


  CMS remove - 

  dialogTitle:  "Withdraw [Insert role name] Access?"
  dialogBody: This action cannot be undone. The [CMS Approver Role Name] will be notified of this change. 
  ariaLabelledBy: "Self Withdraw Access Modal",
  acceptButtonText: Confirm


  State Pending withdraw - 
  dialogTitle: "Withdraw role request?"
  dialogBody: "This role is still pending approval. Withdrawing it will cancel your request." 
  acceptButtonText: "Withdraw request" 


  State remove -
  dialogTitle:  "Withdraw [Insert role name] Access?"
  dialogBody: This action cannot be undone. The [CMS Approver Role Name] will be notified of this change. 
  ariaLabelledBy: "Self Withdraw Access Modal",
  acceptButtonText: Confirm

*/

// get which confirmation text to use
export const getConfirmationModalText = (
  selfRevokeState: StateCode | null,
  selfWithdrawPending: boolean,
  selfRemoveRole: UserRole | null,
) => {
  if (selfRevokeState) {
    return {
      dialogTitle: "Withdraw State Access?",
      dialogBody: `This action cannot be undone. ${convertStateAbbrToFullName(
        selfRevokeState,
      )} State System Admin will be notified.`,
      ariaLabelledBy: "Self Revoke Access Modal",
      dialogConfirm: "Confirm",
    };
  }
  if (selfWithdrawPending) {
    return {
      dialogTitle: "Withdraw Role Request?",
      dialogBody: "This role is still pending approval. Withdrawing it will cancel your request.",
      ariaLabelledBy: "Self Withdraw Pending Access Modal",
      dialogConfirm: "Withdraw request",
    };
  }
  if (selfRemoveRole) {
    const approvingRole = getApprovingRole(selfRemoveRole);
    return {
      dialogTitle: `Withdraw Role ${newUserRoleMap[selfRemoveRole]} Access?`,
      dialogBody: `This action cannot be undone. The ${newUserRoleMap[approvingRole]} will be notified of this change.`,
      ariaLabelledBy: "Self Remove Role Modal",
      dialogConfirm: "Confirm",
    };
  }

  return {
    dialogTitle: "",
    dialogBody: "",
    ariaLabelledBy: "",
    dialogConfirm: "Confirm",
  };
};
