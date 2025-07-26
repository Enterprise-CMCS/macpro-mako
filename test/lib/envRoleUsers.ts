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
    cmsReviewer: {
      username: "reviewer@example.com",
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
