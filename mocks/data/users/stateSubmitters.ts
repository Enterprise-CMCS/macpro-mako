import { TestUserDataWithRole } from "../../index.d";

export const CO_STATE_SUBMITTER_EMAIL = "submitter@example.com";
export const CO_STATE_SUBMITTER_USERNAME = "c16071b6-e24b-4405-962c-37ad6262708c";
export const DENIED_STATE_SUBMITTER_EMAIL = "denied@example.com";
export const DENIED_STATE_SUBMITTER_USERNAME = "d1e1c173-5c37-4bb0-a29a-f67eefa23465";
export const INVALID_EMAIL_STATE_SUBMITTER_EMAIL = "bademail-";
export const INVALID_EMAIL_STATE_SUBMITTER_USERNAME = "f8e64f73-d121-4252-b9e3-1f4df902a1c2";
export const MAKO_STATE_SUBMITTER_EMAIL = "mako.stateuser@gmail.com";
export const MAKO_STATE_SUBMITTER_USERNAME = "cd400c39-9e7c-4341-b62f-234e2ecb339d";
export const MULTI_STATE_SUBMITTER_EMAIL = "multistate@example.com";
export const MULTI_STATE_SUBMITTER_USERNAME = "3de7904e-fc0a-498f-9527-8e39044edf4c";
export const NO_EMAIL_STATE_SUBMITTER_USERNAME = "f8e64f73-d121-4252-b9e3-1f4df902a1c2";
export const NO_STATE_SUBMITTER_EMAIL = "nostate@example.com";
export const NO_STATE_SUBMITTER_USERNAME = "604551c7-a98f-4971-aa1e-06dee6f28598";
export const NULL_STATE_SUBMITTER_EMAIL = "nullstate@example.com";
export const NULL_STATE_SUBMITTER_USERNAME = "7b1d217e-fcff-490a-af11-cd07a681789e";
export const OS_STATE_SUBMITTER_EMAIL = "statesubmitter@nightwatch.test";
export const OS_STATE_SUBMITTER_USERNAME = "d4b8f498-d001-7038-15f6-d7a1a1e677e1";
export const OS_STATE_SYSTEM_ADMIN_EMAIL = "statesystemadmin@nightwatch.test";
export const OS_STATE_SYSTEM_ADMIN_USERNAME = "142824f8-f011-703f-c22b-62e027e9435e";
export const PENDING_STATE_SUBMITTER_EMAIL = "pending@example.com";
export const PENDING_STATE_SUBMITTER_USERNAME = "249efcea-ab76-4758-b0a2-17dbb081925b";
export const REVOKED_STATE_SUBMITTER_EMAIL = "revoked@example.com";
export const REVOKED_STATE_SUBMITTER_USERNAME = "76786d25-1428-4da6-841b-cba6b308e881";
export const STATE_SUBMITTER_EMAIL = "george@example.com";
export const STATE_SUBMITTER_USERNAME = "c4087448-d0e1-70c1-3d74-4f8bd1fa13fd";
export const TEST_NEW_STATE_SUBMITTER_EMAIL = "new-state-submitter@example.com";
export const TEST_NEW_STATE_SUBMITTER_USERNAME = "f8e64f73-d121-4252-b9e3-1f4df902a1c1";

export const coStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: CO_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "State",
    },
    {
      Name: "family_name",
      Value: "Submitter",
    },
    {
      Name: "custom:state",
      Value: "CO",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: CO_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: CO_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["CO"],
};

export const deniedStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: DENIED_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Denied",
    },
    {
      Name: "family_name",
      Value: "State",
    },
    {
      Name: "custom:state",
      Value: "MD",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: DENIED_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: DENIED_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["MD"],
};

export const invalidEmailStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: INVALID_EMAIL_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Test",
    },
    {
      Name: "family_name",
      Value: "Submitter",
    },
    {
      Name: "custom:state",
      Value: "AK",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: INVALID_EMAIL_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: INVALID_EMAIL_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["AK"],
};

export const makoStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: MAKO_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Stateuser",
    },
    {
      Name: "family_name",
      Value: "Tester",
    },
    {
      Name: "custom:state",
      Value: "VA,OH,SC,CO,GA,MD",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: MAKO_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: MAKO_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["VA", "OH", "SC", "CO", "GA", "MD"],
};

export const multiStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: MULTI_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Multi",
    },
    {
      Name: "family_name",
      Value: "State",
    },
    {
      Name: "custom:state",
      Value: "CA,NY,MD",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: MULTI_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: MULTI_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["CA", "NY", "MD"],
};

export const noEmailStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Test",
    },
    {
      Name: "family_name",
      Value: "Submitter",
    },
    {
      Name: "custom:state",
      Value: "LA",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: NO_EMAIL_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: NO_EMAIL_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["LA"],
};

export const noStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: NO_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "No",
    },
    {
      Name: "family_name",
      Value: "State",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: NO_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: NO_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: [],
};

export const nullStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: NULL_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Null",
    },
    {
      Name: "family_name",
      Value: "State",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: NULL_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: NULL_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: [],
};

export const osStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: OS_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "family_name",
      Value: "Submitter Test",
    },
    {
      Name: "given_name",
      Value: "State",
    },
    {
      Name: "custom:state",
      Value: "VA,OH,SC,CO,GA,MD,CA",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: OS_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: OS_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["VA", "OH", "SC", "CO", "GA", "MD", "CA"],
};

export const osStateSystemAdmin: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: OS_STATE_SYSTEM_ADMIN_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "family_name",
      Value: "Again",
    },
    {
      Name: "given_name",
      Value: "Test",
    },
    {
      Name: "custom:state",
      Value: "MD",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: OS_STATE_SYSTEM_ADMIN_USERNAME,
    },
  ],
  Username: OS_STATE_SYSTEM_ADMIN_USERNAME,
  role: "statesystemadmin",
  states: ["MD"],
};

export const pendingStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: PENDING_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Pending",
    },
    {
      Name: "family_name",
      Value: "State",
    },
    {
      Name: "custom:state",
      Value: "MD",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: PENDING_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: PENDING_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["MD"],
};

export const revokedStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: REVOKED_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Revoked",
    },
    {
      Name: "family_name",
      Value: "State",
    },
    {
      Name: "custom:state",
      Value: "MD",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: REVOKED_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: REVOKED_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["MD"],
};

export const stateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "George",
    },
    {
      Name: "family_name",
      Value: "Harrison",
    },
    {
      Name: "custom:state",
      Value: "VA,OH,SC,CO,CA,MD",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["VA", "OH", "SC", "CO", "CA", "MD"],
};

export const testNewStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: TEST_NEW_STATE_SUBMITTER_EMAIL,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Test",
    },
    {
      Name: "family_name",
      Value: "Submitter",
    },
    {
      Name: "custom:state",
      Value: "VA",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: TEST_NEW_STATE_SUBMITTER_USERNAME,
    },
  ],
  Username: TEST_NEW_STATE_SUBMITTER_USERNAME,
  role: "statesubmitter",
  states: ["VA"],
};

export const stateSubmitterUsernamesByEmail = {
  [CO_STATE_SUBMITTER_EMAIL]: CO_STATE_SUBMITTER_USERNAME,
  [DENIED_STATE_SUBMITTER_EMAIL]: DENIED_STATE_SUBMITTER_USERNAME,
  [INVALID_EMAIL_STATE_SUBMITTER_EMAIL]: INVALID_EMAIL_STATE_SUBMITTER_USERNAME,
  [MAKO_STATE_SUBMITTER_EMAIL]: MAKO_STATE_SUBMITTER_USERNAME,
  [MULTI_STATE_SUBMITTER_EMAIL]: MULTI_STATE_SUBMITTER_USERNAME,
  "no-email": NO_EMAIL_STATE_SUBMITTER_USERNAME,
  [NO_STATE_SUBMITTER_EMAIL]: NO_STATE_SUBMITTER_USERNAME,
  [NULL_STATE_SUBMITTER_EMAIL]: NULL_STATE_SUBMITTER_USERNAME,
  [OS_STATE_SUBMITTER_EMAIL]: OS_STATE_SUBMITTER_USERNAME,
  [OS_STATE_SYSTEM_ADMIN_EMAIL]: OS_STATE_SYSTEM_ADMIN_USERNAME,
  [PENDING_STATE_SUBMITTER_EMAIL]: PENDING_STATE_SUBMITTER_USERNAME,
  [REVOKED_STATE_SUBMITTER_EMAIL]: REVOKED_STATE_SUBMITTER_USERNAME,
  [STATE_SUBMITTER_EMAIL]: STATE_SUBMITTER_USERNAME,
  [TEST_NEW_STATE_SUBMITTER_EMAIL]: TEST_NEW_STATE_SUBMITTER_USERNAME,
};

export const stateSubmitters: TestUserDataWithRole[] = [
  coStateSubmitter,
  deniedStateSubmitter,
  invalidEmailStateSubmitter,
  makoStateSubmitter,
  multiStateSubmitter,
  noEmailStateSubmitter,
  noStateSubmitter,
  nullStateSubmitter,
  osStateSubmitter,
  osStateSystemAdmin,
  pendingStateSubmitter,
  revokedStateSubmitter,
  stateSubmitter,
  testNewStateSubmitter,
];
