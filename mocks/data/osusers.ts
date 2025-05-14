import { TestUserDocument, TestUserResult } from "../index.d";

export const SYSTEM_ADMIN_EMAIL = "systemadmin@example.com";
export const HELP_DESK_EMAIL = "helpdesk@example.com";
export const CMS_ROLE_APPROVER_EMAIL = "cmsroleapprover@example.com";
export const DEFAULT_CMS_USER_EMAIL = "defaultcmsuser@example.com";
export const CMS_REVIEWER_EMAIL = "reviewer@example.com";
export const TEST_CMS_REVIEWER_EMAIL = "mako.cmsuser@outlook.com";
export const STATE_SYSTEM_ADMIN_EMAIL = "statesystemadmin@nightwatch.test";
export const STATE_SUBMITTER_EMAIL = "statesubmitter@nightwatch.test";
export const TEST_STATE_SUBMITTER_EMAIL = "mako.stateuser@gmail.com";
export const MULTI_STATE_SUBMITTER_EMAIL = "multistate@example.com";
export const NULL_STATE_SUBMITTER_EMAIL = "nullstate@example.com";
export const NO_STATE_SUBMITTER_EMAIL = "nostate@example.com";
export const PENDING_SUBMITTER_EMAIL = "pending@example.com";
export const DENIED_SUBMITTER_EMAIL = "denied@example.com";
export const REVOKED_SUBMITTER_EMAIL = "revoked@example.com";

export const osUsers: Record<string, TestUserResult> = {
  [SYSTEM_ADMIN_EMAIL]: {
    _id: SYSTEM_ADMIN_EMAIL,
    found: true,
    _source: {
      id: SYSTEM_ADMIN_EMAIL,
      eventType: "user-info",
      email: SYSTEM_ADMIN_EMAIL,
      fullName: "System Admin",
      role: "systemadmin",
      states: [],
    },
  },
  [HELP_DESK_EMAIL]: {
    _id: HELP_DESK_EMAIL,
    found: true,
    _source: {
      id: HELP_DESK_EMAIL,
      eventType: "user-info",
      email: HELP_DESK_EMAIL,
      fullName: "CMS Helpdesk",
      role: "helpdesk",
      states: [],
    },
  },
  [CMS_ROLE_APPROVER_EMAIL]: {
    _id: CMS_ROLE_APPROVER_EMAIL,
    found: true,
    _source: {
      id: CMS_ROLE_APPROVER_EMAIL,
      eventType: "user-info",
      email: CMS_ROLE_APPROVER_EMAIL,
      fullName: "CMSRole Approver",
      role: "cmsroleapprover",
      group: "Group 1",
      division: "Division 1",
      states: [],
    },
  },
  [DEFAULT_CMS_USER_EMAIL]: {
    _id: DEFAULT_CMS_USER_EMAIL,
    found: true,
    _source: {
      id: DEFAULT_CMS_USER_EMAIL,
      eventType: "user-info",
      email: DEFAULT_CMS_USER_EMAIL,
      fullName: "DefaultCMS User",
      role: "defaultcmsuser",
      states: [],
    },
  },
  [CMS_REVIEWER_EMAIL]: {
    _id: CMS_REVIEWER_EMAIL,
    found: true,
    _source: {
      id: CMS_REVIEWER_EMAIL,
      eventType: "user-info",
      email: CMS_REVIEWER_EMAIL,
      fullName: "CMS Reviewer",
      role: "cmsreviewer",
      states: [],
    },
  },
  [TEST_CMS_REVIEWER_EMAIL]: {
    _id: TEST_CMS_REVIEWER_EMAIL,
    found: true,
    _source: {
      id: TEST_CMS_REVIEWER_EMAIL,
      eventType: "user-info",
      email: TEST_CMS_REVIEWER_EMAIL,
      fullName: "CMSReviewer Tester",
      role: "cmsreviewer",
      states: [],
    },
  },
  [STATE_SYSTEM_ADMIN_EMAIL]: {
    _id: STATE_SYSTEM_ADMIN_EMAIL,
    found: true,
    _source: {
      id: STATE_SYSTEM_ADMIN_EMAIL,
      eventType: "user-info",
      email: STATE_SYSTEM_ADMIN_EMAIL,
      fullName: "Statesystemadmin Nightwatch",
      role: "statesystemadmin",
      states: [],
    },
  },
  [STATE_SUBMITTER_EMAIL]: {
    _id: STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: STATE_SUBMITTER_EMAIL,
      fullName: "Statesubmitter Nightwatch",
      role: "statesubmitter",
      states: ["VA", "OH", "SC", "CO", "GA", "MD"],
    },
  },
  [TEST_STATE_SUBMITTER_EMAIL]: {
    _id: TEST_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: TEST_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: TEST_STATE_SUBMITTER_EMAIL,
      fullName: "Stateuser Tester",
      role: "statesubmitter",
      states: ["VA", "OH", "SC", "CO", "GA", "MD"],
    },
  },
  [MULTI_STATE_SUBMITTER_EMAIL]: {
    _id: MULTI_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: MULTI_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: MULTI_STATE_SUBMITTER_EMAIL,
      fullName: "Multi State",
      role: "statesubmitter",
      states: ["VA", "OH", "SC", "CO", "GA", "MD"],
    },
  },
  [NO_STATE_SUBMITTER_EMAIL]: {
    _id: NO_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: NO_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: NO_STATE_SUBMITTER_EMAIL,
      fullName: "No State",
      role: "statesubmitter",
      states: [],
    },
  },
  [NULL_STATE_SUBMITTER_EMAIL]: {
    _id: NULL_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: NULL_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: NULL_STATE_SUBMITTER_EMAIL,
      fullName: "Null State",
      role: "statesubmitter",
      states: [],
    },
  },
  [PENDING_SUBMITTER_EMAIL]: {
    _id: PENDING_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: PENDING_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: PENDING_SUBMITTER_EMAIL,
      fullName: "Pending State",
      role: "statesubmitter",
      states: [],
    },
  },
  [DENIED_SUBMITTER_EMAIL]: {
    _id: DENIED_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: DENIED_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: DENIED_SUBMITTER_EMAIL,
      fullName: "Denied State",
      role: "statesubmitter",
      states: [],
    },
  },
  [REVOKED_SUBMITTER_EMAIL]: {
    _id: REVOKED_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: REVOKED_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: REVOKED_SUBMITTER_EMAIL,
      fullName: "Revoked State",
      role: "statesubmitter",
      states: [],
    },
  },
};

export const STATE_SYSTEM_ADMIN_USER = osUsers[STATE_SYSTEM_ADMIN_EMAIL];
export const STATE_SUBMITTER_USER = osUsers[STATE_SUBMITTER_EMAIL];
export const MULTI_STATE_SUBMITTER_USER = osUsers[MULTI_STATE_SUBMITTER_EMAIL];
export const NO_STATE_SUBMITTER_USER = osUsers[NO_STATE_SUBMITTER_EMAIL];

export const userResultList = Object.values(osUsers);

export const getFilteredUserResultList = (emails: string[]) =>
  userResultList.filter((user) => emails.includes(user?._source?.email || ""));

export const userDocList: TestUserDocument[] = userResultList
  .filter((user) => user?._source)
  .map((user) => user?._source as TestUserDocument);

export const getFilteredUserDocList = (emails: string[]) =>
  userDocList.filter((user) => emails.includes(user?.email || ""));
