import { TestUserDataWithRole } from "../../index.d";

export const automatedStateSubmitterUsername = "f3a1b6d6-3bc9-498d-ac22-41a6d46982c9";
export const makoStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "mako.stateuser@gmail.com",
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
      Value: "cd400c39-9e7c-4341-b62f-234e2ecb339d",
    },
  ],
  Username: "cd400c39-9e7c-4341-b62f-234e2ecb339d",
  role: "statesubmitter",
  states: ["VA", "OH", "SC", "CO", "GA", "MD"],
};
export const superUser: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "mako.stateuser@gmail.com",
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
      Value: "ZZ",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-micro-super",
    },
    {
      Name: "sub",
      Value: "cd400c39-9e7c-4341-b62f-234e2ecb339e",
    },
  ],
  Username: "cd400c39-9e7c-4341-b62f-234e2ecb339e",
  role: "statesubmitter",
  states: ["ZZ"],
};

export const stateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "george@example.com",
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
      Value: "c4087448-d0e1-70c1-3d74-4f8bd1fa13fd",
    },
  ],
  Username: "c4087448-d0e1-70c1-3d74-4f8bd1fa13fd",
  role: "statesubmitter",
  states: ["VA", "OH", "SC", "CO", "CA", "MD"],
};

export const noDataStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "nodata@example.com",
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
      Value: "VI",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: "068f3852-dd7e-484d-a423-578556f52886",
    },
  ],
  Username: "068f3852-dd7e-484d-a423-578556f52886",
  role: "statesubmitter",
  states: ["VI"],
};

export const coStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "submitter@example.com",
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
      Value: "c16071b6-e24b-4405-962c-37ad6262708c",
    },
  ],
  Username: "c16071b6-e24b-4405-962c-37ad6262708c",
  role: "statesubmitter",
  states: ["CO"],
};

export const multiStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "multistate@example.com",
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
      Value: "3de7904e-fc0a-498f-9527-8e39044edf4c",
    },
  ],
  Username: "3de7904e-fc0a-498f-9527-8e39044edf4c",
  role: "statesubmitter",
  states: ["CA", "NY", "MD"],
};

export const noStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "nostate@example.com",
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
      Value: "604551c7-a98f-4971-aa1e-06dee6f28598",
    },
  ],
  Username: "604551c7-a98f-4971-aa1e-06dee6f28598",
  role: "statesubmitter",
  states: [],
};

export const nullStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "nullstate@example.com",
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
      Value: "7b1d217e-fcff-490a-af11-cd07a681789e",
    },
  ],
  Username: "7b1d217e-fcff-490a-af11-cd07a681789e",
  role: "statesubmitter",
  states: [],
};

export const automatedStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "automated-state@example.com",
    },
    {
      Name: "email_verified",
      Value: "true",
    },
    {
      Name: "given_name",
      Value: "Otto",
    },
    {
      Name: "family_name",
      Value: "State",
    },
    {
      Name: "custom:state",
      Value: "TX,CA,NY,FL",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: automatedStateSubmitterUsername,
    },
  ],
  Username: automatedStateSubmitterUsername,
  role: "statesubmitter",
  states: ["TX", "CA", "NY", "FL"],
};

export const pendingStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "pending@example.com",
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
      Value: "249efcea-ab76-4758-b0a2-17dbb081925b",
    },
  ],
  Username: "249efcea-ab76-4758-b0a2-17dbb081925b",
  role: "statesubmitter",
  states: ["MD"],
};

export const deniedStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "denied@example.com",
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
      Value: "d1e1c173-5c37-4bb0-a29a-f67eefa23465",
    },
  ],
  Username: "d1e1c173-5c37-4bb0-a29a-f67eefa23465",
  role: "statesubmitter",
  states: ["MD"],
};

export const revokedStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "revoked@example.com",
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
      Value: "76786d25-1428-4da6-841b-cba6b308e881",
    },
  ],
  Username: "76786d25-1428-4da6-841b-cba6b308e881",
  role: "statesubmitter",
  states: ["MD"],
};

export const testNewStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "new-state-submitter@example.com",
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
      Value: "f8e64f73-d121-4252-b9e3-1f4df902a1c1",
    },
  ],
  Username: "f8e64f73-d121-4252-b9e3-1f4df902a1c1",
  role: "statesubmitter",
  states: ["VA"],
};

export const noEmailStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "bademail-",
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
      Value: "LA",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: "f8e64f73-d121-4252-b9e3-1f4df902a1c2",
    },
  ],
  Username: "f8e64f73-d121-4252-b9e3-1f4df902a1c2",
  role: "statesubmitter",
  states: ["LA"],
};

export const invalidEmailStateSubmitter: TestUserDataWithRole = {
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
      Value: "AK",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-state-user",
    },
    {
      Name: "sub",
      Value: "f8e64f73-d121-4252-b9e3-1f4df902a1c2",
    },
  ],
  Username: "f8e64f73-d121-4252-b9e3-1f4df902a1c2",
  role: "statesubmitter",
  states: ["AK"],
};

export const osStateSystemAdmin: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "statesystemadmin@nightwatch.test",
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
      Value: "142824f8-f011-703f-c22b-62e027e9435e",
    },
  ],
  Username: "142824f8-f011-703f-c22b-62e027e9435e",
  role: "statesystemadmin",
  states: ["MD"],
};

export const osStateSubmitter: TestUserDataWithRole = {
  UserAttributes: [
    {
      Name: "email",
      Value: "statesubmitter@nightwatch.test",
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
      Value: "d4b8f498-d001-7038-15f6-d7a1a1e677e1",
    },
  ],
  Username: "d4b8f498-d001-7038-15f6-d7a1a1e677e1",
  role: "statesubmitter",
  states: ["VA", "OH", "SC", "CO", "GA", "MD", "CA"],
};

export const stateSubmitters: TestUserDataWithRole[] = [
  makoStateSubmitter,
  superUser,
  stateSubmitter,
  noDataStateSubmitter,
  coStateSubmitter,
  multiStateSubmitter,
  noStateSubmitter,
  nullStateSubmitter,
  automatedStateSubmitter,
  testNewStateSubmitter,
  noEmailStateSubmitter,
  invalidEmailStateSubmitter,
  osStateSystemAdmin,
  osStateSubmitter,
  pendingStateSubmitter,
  revokedStateSubmitter,
  deniedStateSubmitter,
];
