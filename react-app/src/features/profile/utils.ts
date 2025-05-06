import { StateAccess } from "@/api";
import { convertStateAbbrToFullName } from "@/utils";

export const userRoleMap = {
  defaultcmsuser: "Default CMS User Placeholder",
  cmsroleapprover: "CMS Role Approver",
  cmsreviewer: "CMS Reviewer",
  statesystemadmin: "State System Admin",
  helpdesk: "Helpdesk",
  statesubmitter: "State Submitter",
  systemadmin: "System Admin",
};

export const adminRoles = ["statesubmitter", "statesystemadmin"];

export const orderStateAccess = (accesses: StateAccess[]) => {
  if (!accesses || !accesses.length) return;
  // sort revoked states separately and add to
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
