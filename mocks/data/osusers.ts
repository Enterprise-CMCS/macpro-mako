export const STATE_SYSTEM_ADMIN_EMAIL = "statesystemadmin@nightwatch.test";
export const STATE_SUBMITTER_EMAIL = "statesubmitter@nightwatch.test";
export const TEST_STATE_SUBMITTER_EMAIL = "mako.stateuser@gmail.com";
export const MULTI_STATE_SUBMITTER_EMAIL = "multistate@example.com";
export const NO_STATE_SUBMITTER_EMAIL = "nostate@example.com";
export const TEST_CMS_REVIEWER_EMAIL = "mako.cmsuser@outlook.com";

export const idmUsers = {
  [STATE_SYSTEM_ADMIN_EMAIL]: {
    _id: STATE_SYSTEM_ADMIN_EMAIL,
    found: true,
    _source: {
      id: STATE_SYSTEM_ADMIN_EMAIL,
      eventType: "user-info",
      email: STATE_SYSTEM_ADMIN_EMAIL,
      fullName: "Statesystemadmin Nightwatch",
      role: "statesystemadmin",
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
    },
  },
  [TEST_CMS_REVIEWER_EMAIL]: {
    _id: TEST_CMS_REVIEWER_EMAIL,
    found: true,
    _source: {
      id: TEST_CMS_REVIEWER_EMAIL,
      eventType: "user-info",
      email: TEST_CMS_REVIEWER_EMAIL,
      fullName: "CMS Reviewer Cypress",
      role: "cmsreviewer",
    },
  },
};

export const STATE_SYSTEM_ADMIN_USER = idmUsers[STATE_SYSTEM_ADMIN_EMAIL];
export const STATE_SUBMITTER_USER = idmUsers[STATE_SUBMITTER_EMAIL];
export const MULTI_STATE_SUBMITTER_USER = idmUsers[MULTI_STATE_SUBMITTER_EMAIL];
export const NO_STATE_SUBMITTER_USER = idmUsers[NO_STATE_SUBMITTER_EMAIL];

export const userResultList = Object.values(idmUsers);

export const getFilteredUserResultList = (emails: string[]) =>
  userResultList.filter((user) => emails.includes(user?._source?.email || ""));

export const userDocList = userResultList
  .filter((user) => user?._source)
  .map((user) => user?._source);

export const getFilteredUserDocList = (emails: string[]) =>
  userDocList.filter((user) => emails.includes(user?.email || ""));
