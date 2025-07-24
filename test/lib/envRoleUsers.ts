export interface RoleUser {
  username: string;
  password?: string;
  capabilities: string[];
}

export const envRoleUsers: Record<string, Record<string, RoleUser>> = {
  local: {
    stateSubmitter: {
      username: "george@example.com",
      capabilities: ["dashboard", "profile", "stateCHIPSPA", "a11y"],
    },
    submitter: {
      username: "submitter@example.com",
      capabilities: [],
    },
    stateSystemAdmin: {
      username: "statesystemadmin.com",
      capabilities: ["dashboard", "profile", "stateCHIPSPA"],
    },
    cmsReviewer: {
      username: "reviewer@example.com",
      capabilities: ["dashboard", "profile"],
    },
    cmsRoleApprover: {
      username: "cmsroleapprover@example.com",
      capabilities: ["dashboard", "profile"],
    },
    systemAdmin: {
      username: "systemadmin@example.com",
      capabilities: ["dashboard", "profile"],
    },
    helpDesk: {
      username: "helpdesk@example.com",
      capabilities: ["dashboard", "profile"],
    },
  },
  dev: {},
  val: {
    stateSubmitter: {
      username: "george@example.com",
      capabilities: ["dashboard", "profile", "stateCHIPSPA"],
    },
    cmsReviewer: {
      username: "reviewer@example.com",
      capabilities: ["dashboard", "profile"],
    },
  },
  ci: {
    stateSubmitter: {
      username: "george@example.com",
      capabilities: ["dashboard", "profile", "a11y"],
    },
    cmsReviewer: {
      username: "reviewer@example.com",
      capabilities: ["dashboard", "profile"],
    },
  },
};
