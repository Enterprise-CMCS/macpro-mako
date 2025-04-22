export const STATE_SYSTEM_ADMIN_EMAIL = "statesystemadmin@nightwatch.test";
export const STATE_SUBMITTER_EMAIL = "statesubmitter@nightwatch.test";

export const idmUsers = {
  [STATE_SYSTEM_ADMIN_EMAIL]: {
    _id: STATE_SYSTEM_ADMIN_EMAIL,
    found: true,
    _source: {
      id: "statesystemadmin@nightwatch.test",
      eventType: "user-info",
      email: "statesystemadmin@nightwatch.test",
      fullName: "Statesystemadmin Nightwatch",
      role: "statesystemadmin",
    },
  },
  [STATE_SUBMITTER_EMAIL]: {
    _id: STATE_SUBMITTER_EMAIL,
    found: true,
    _source: {
      id: "statesubmitter@nightwatch.test",
      eventType: "user-info",
      email: "statesubmitter@nightwatch.test",
      fullName: "Statesubmitter Nightwatch",
      role: "statesubmitter",
    },
  },
};

export const STATE_SYSTEM_ADMIN_USER = idmUsers[STATE_SYSTEM_ADMIN_EMAIL];
export const STATE_SUBMITTER_USER = idmUsers[STATE_SUBMITTER_EMAIL];

export const userResultList = Object.values(idmUsers);

export const getFilteredUserResultList = (emails: string[]) =>
  userResultList.filter((user) => emails.includes(user?._source?.email || ""));

export const userDocList = userResultList
  .filter((user) => user?._source)
  .map((user) => user?._source);

export const getFilteredUserDocList = (emails: string[]) =>
  userDocList.filter((user) => emails.includes(user?.email || ""));
