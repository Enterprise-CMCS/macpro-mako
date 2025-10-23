export interface RoleUser {
  username: string;
  password?: string;
  capabilities: string[];
}

/**
 * defines the env, role and test capbility of the user
 */
export const envRoleUsers: Record<string, Record<string, RoleUser>> = {
  local: {
    stateSubmitter: {
      username: "george@example.com",
      capabilities: ["dashboard", "profile", "stateCHIPSPA"],
    },
    submitter: {
      username: "submitter@example.com",
      capabilities: [],
    },
    stateSystemAdmin: {
      username: "statesystemadmin@example.com",
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
  prod: {
    stateSubmitter: {
      username: process.env.ZZSTATE,
      password: process.env.ZZSTATEPW,
      capabilities: ["prod"],
    },
    cmsReviewer: {
      username: process.env.EUAID,
      password: process.env.EUAPW,
      capabilities: ["prod"],
    },
  },
};
