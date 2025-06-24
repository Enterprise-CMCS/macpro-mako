import { TestUserDocument, TestUserResult } from "../index.d";
import {
  CMS_ROLE_APPROVER_EMAIL,
  CO_STATE_SUBMITTER_EMAIL,
  DEFAULT_CMS_USER_EMAIL,
  DENIED_STATE_SUBMITTER_EMAIL,
  HELP_DESK_USER_EMAIL,
  INVALID_EMAIL_STATE_SUBMITTER_EMAIL,
  MAKO_REVIEWER_EMAIL,
  MAKO_STATE_SUBMITTER_EMAIL,
  MULTI_STATE_SUBMITTER_EMAIL,
  NO_STATE_SUBMITTER_EMAIL,
  NULL_STATE_SUBMITTER_EMAIL,
  OS_STATE_SUBMITTER_EMAIL,
  OS_STATE_SYSTEM_ADMIN_EMAIL,
  PENDING_STATE_SUBMITTER_EMAIL,
  REVIEWER_EMAIL,
  REVOKED_STATE_SUBMITTER_EMAIL,
  STATE_SUBMITTER_EMAIL,
  SUPER_REVIEWER_EMAIL,
  SYSTEM_ADMIN_EMAIL,
  TEST_NEW_STATE_SUBMITTER_EMAIL,
} from "./users/index";

export const osUsers: Record<string, TestUserResult> = {
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
  [CO_STATE_SUBMITTER_EMAIL]: {
    _id: CO_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: CO_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: CO_STATE_SUBMITTER_EMAIL,
      fullName: "State Submitter",
      role: "statesubmitter",
      states: ["CO"],
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
  [DENIED_STATE_SUBMITTER_EMAIL]: {
    _id: DENIED_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: DENIED_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: DENIED_STATE_SUBMITTER_EMAIL,
      fullName: "Denied State",
      role: "statesubmitter",
      states: [],
    },
  },
  [HELP_DESK_USER_EMAIL]: {
    _id: HELP_DESK_USER_EMAIL,
    found: true,
    _source: {
      id: HELP_DESK_USER_EMAIL,
      eventType: "user-info",
      email: HELP_DESK_USER_EMAIL,
      fullName: "CMS Helpdesk",
      role: "helpdesk",
      states: [],
    },
  },
  [INVALID_EMAIL_STATE_SUBMITTER_EMAIL]: {
    _id: INVALID_EMAIL_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: INVALID_EMAIL_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: INVALID_EMAIL_STATE_SUBMITTER_EMAIL,
      fullName: "Test Submitter",
      role: "statesubmitter",
      states: ["AK"],
    },
  },
  [MAKO_REVIEWER_EMAIL]: {
    _id: MAKO_REVIEWER_EMAIL,
    found: true,
    _source: {
      id: MAKO_REVIEWER_EMAIL,
      eventType: "user-info",
      email: MAKO_REVIEWER_EMAIL,
      fullName: "CMSReviewer Tester",
      role: "cmsreviewer",
      states: [],
    },
  },
  [MAKO_STATE_SUBMITTER_EMAIL]: {
    _id: MAKO_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: MAKO_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: MAKO_STATE_SUBMITTER_EMAIL,
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
      role: "norole",
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
  [OS_STATE_SUBMITTER_EMAIL]: {
    _id: OS_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: OS_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: OS_STATE_SUBMITTER_EMAIL,
      fullName: "Statesubmitter Nightwatch",
      role: "statesubmitter",
      states: ["VA", "OH", "SC", "CO", "GA", "MD"],
    },
  },
  [OS_STATE_SYSTEM_ADMIN_EMAIL]: {
    _id: OS_STATE_SYSTEM_ADMIN_EMAIL,
    found: true,
    _source: {
      id: OS_STATE_SYSTEM_ADMIN_EMAIL,
      eventType: "user-info",
      email: OS_STATE_SYSTEM_ADMIN_EMAIL,
      fullName: "Statesystemadmin Nightwatch",
      role: "statesystemadmin",
      states: [],
    },
  },
  [PENDING_STATE_SUBMITTER_EMAIL]: {
    _id: PENDING_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: PENDING_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: PENDING_STATE_SUBMITTER_EMAIL,
      fullName: "Pending State",
      role: "statesubmitter",
      states: [],
    },
  },
  [REVIEWER_EMAIL]: {
    _id: REVIEWER_EMAIL,
    found: true,
    _source: {
      id: REVIEWER_EMAIL,
      eventType: "user-info",
      email: REVIEWER_EMAIL,
      fullName: "CMS Reviewer",
      role: "cmsreviewer",
      states: [],
    },
  },
  [REVOKED_STATE_SUBMITTER_EMAIL]: {
    _id: REVOKED_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: REVOKED_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: REVOKED_STATE_SUBMITTER_EMAIL,
      fullName: "Revoked State",
      role: "statesubmitter",
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
      fullName: "George Harrison",
      role: "statesubmitter",
      states: ["VA", "OH", "SC", "CO", "CA", "MD"],
    },
  },
  [SUPER_REVIEWER_EMAIL]: {
    _id: SUPER_REVIEWER_EMAIL,
    found: true,
    _source: {
      id: SUPER_REVIEWER_EMAIL,
      eventType: "user-info",
      email: SUPER_REVIEWER_EMAIL,
      fullName: "Superduper Paratrooper",
      role: "cmsreviewer",
      states: [],
    },
  },
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
  [TEST_NEW_STATE_SUBMITTER_EMAIL]: {
    _id: TEST_NEW_STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: TEST_NEW_STATE_SUBMITTER_EMAIL,
      eventType: "user-info",
      email: TEST_NEW_STATE_SUBMITTER_EMAIL,
      fullName: "Test Submitter",
      role: "statesubmitter",
      states: ["VA"],
    },
  },
};

export const STATE_SYSTEM_ADMIN_USER = osUsers[OS_STATE_SYSTEM_ADMIN_EMAIL];
export const STATE_SUBMITTER_USER = osUsers[OS_STATE_SUBMITTER_EMAIL];
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
