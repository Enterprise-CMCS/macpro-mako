import { TestUserData } from "../../index.d";

export const automatedStateSubmitterUsername = "f3a1b6d6-3bc9-498d-ac22-41a6d46982c9";
export const makoStateSubmitter: TestUserData = {
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
      Value: "onemac-micro-statesubmitter",
    },
    {
      Name: "sub",
      Value: "cd400c39-9e7c-4341-b62f-234e2ecb339d",
    },
  ],
  Username: "cd400c39-9e7c-4341-b62f-234e2ecb339d",
};

export const stateSubmitter: TestUserData = {
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
      Value: "onemac-micro-statesubmitter",
    },
    {
      Name: "sub",
      Value: "c4087448-d0e1-70c1-3d74-4f8bd1fa13fd",
    },
  ],
  Username: "c4087448-d0e1-70c1-3d74-4f8bd1fa13fd",
};

export const noDataStateSubmitter: TestUserData = {
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
      Value: "onemac-micro-statesubmitter",
    },
    {
      Name: "sub",
      Value: "068f3852-dd7e-484d-a423-578556f52886",
    },
  ],
  Username: "068f3852-dd7e-484d-a423-578556f52886",
};

export const coStateSubmitter: TestUserData = {
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
      Value: "onemac-micro-statesubmitter",
    },
    {
      Name: "sub",
      Value: "c16071b6-e24b-4405-962c-37ad6262708c",
    },
  ],
  Username: "c16071b6-e24b-4405-962c-37ad6262708c",
};

export const multiStateSubmitter: TestUserData = {
  UserAttributes: [
    {
      Name: "email",
      Value: "statemulti@example.com",
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
      Value: "Multi",
    },
    {
      Name: "custom:state",
      Value: "CA,NY,MD",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-micro-statesubmitter",
    },
    {
      Name: "sub",
      Value: "3de7904e-fc0a-498f-9527-8e39044edf4c",
    },
  ],
  Username: "3de7904e-fc0a-498f-9527-8e39044edf4c",
};

export const noStateSubmitter: TestUserData = {
  UserAttributes: [
    {
      Name: "email",
      Value: "statemulti@example.com",
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
      Value: "Multi",
    },
    {
      Name: "custom:state",
      Value: "",
    },
    {
      Name: "custom:cms-roles",
      Value: "onemac-micro-statesubmitter",
    },
    {
      Name: "sub",
      Value: "604551c7-a98f-4971-aa1e-06dee6f28598",
    },
  ],
  Username: "604551c7-a98f-4971-aa1e-06dee6f28598",
};

export const automatedStateSubmitter: TestUserData = {
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
      Value: "onemac-micro-statesubmitter",
    },
    {
      Name: "sub",
      Value: automatedStateSubmitterUsername,
    },
  ],
  Username: automatedStateSubmitterUsername,
};

export const testNewStateSubmitter: TestUserData = {
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
      Value: "onemac-micro-statesubmitter",
    },
    {
      Name: "sub",
      Value: "f8e64f73-d121-4252-b9e3-1f4df902a1c1",
    },
  ],
  Username: "f8e64f73-d121-4252-b9e3-1f4df902a1c1",
};

export const stateSubmitters: TestUserData[] = [
  makoStateSubmitter,
  stateSubmitter,
  noDataStateSubmitter,
  coStateSubmitter,
  multiStateSubmitter,
  noStateSubmitter,
  automatedStateSubmitter,
  testNewStateSubmitter,
];
