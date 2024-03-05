import { describe, it, expect } from "vitest";
import {
  isCmsReadonlyUser,
  isCmsUser,
  isCmsWriteUser,
  isIDM,
  isStateUser,
} from "../user-helper";
import {
  testCMSCognitoUser,
  testCMSIDMUser,
  testStateCognitoUser,
  testStateIDMUser,
} from "./testData";
import { CognitoUserAttributes } from "shared-types";

const cmsHelpDeskUser: CognitoUserAttributes = {
  ...testCMSCognitoUser.user,
  "custom:cms-roles": "onemac-micro-helpdesk",
};
const cmsReadOnlyUser: CognitoUserAttributes = {
  ...testCMSCognitoUser.user,
  "custom:cms-roles": "onemac-micro-readonly",
};
const cmsReviewerUser: CognitoUserAttributes = {
  ...testCMSCognitoUser.user,
  "custom:cms-roles": "onemac-micro-reviewer",
};
const stateSubmitterUser: CognitoUserAttributes = testStateCognitoUser.user;

describe("isCmsUser", () => {
  it("returns true for CMS users", () => {
    expect(isCmsUser(cmsHelpDeskUser)).toEqual(true);
    expect(isCmsUser(cmsReadOnlyUser)).toEqual(true);
    expect(isCmsUser(cmsReviewerUser)).toEqual(true);
  });
  it("returns false for State users", () => {
    expect(isCmsUser(stateSubmitterUser)).toEqual(false);
  });
});

describe("isCmsWriteUser", () => {
  it("returns true for CMS Write users", () => {
    expect(isCmsWriteUser(cmsReviewerUser)).toEqual(true);
  });
  it("returns false for CMS Read-Only users", () => {
    expect(isCmsWriteUser(cmsReadOnlyUser)).toEqual(false);
    expect(isCmsWriteUser(cmsHelpDeskUser)).toEqual(false);
  });
  it("returns false for State users", () => {
    expect(isCmsWriteUser(stateSubmitterUser)).toEqual(false);
  });
});

describe("isCmsReadonlyUser", () => {
  it("returns false for CMS Write users", () => {
    expect(isCmsReadonlyUser(cmsReviewerUser)).toEqual(false);
  });
  it("returns true for CMS Read-Only users", () => {
    expect(isCmsReadonlyUser(cmsReadOnlyUser)).toEqual(true);
    expect(isCmsReadonlyUser(cmsHelpDeskUser)).toEqual(true);
  });
  it("returns false for State users", () => {
    expect(isCmsReadonlyUser(stateSubmitterUser)).toEqual(false);
  });
});

describe("isStateUser", () => {
  it("returns false for CMS Write users", () => {
    expect(isStateUser(cmsReviewerUser)).toEqual(false);
  });
  it("returns true for CMS Read-Only users", () => {
    expect(isStateUser(cmsReadOnlyUser)).toEqual(false);
    expect(isStateUser(cmsHelpDeskUser)).toEqual(false);
  });
  it("returns false for State users", () => {
    expect(isStateUser(stateSubmitterUser)).toEqual(true);
  });
});

describe("isIDM", () => {
  it("returns false if a user has no Cognito identities", () => {
    expect(isIDM(testStateCognitoUser.user.identities)).toBe(false);
    expect(isIDM(testCMSCognitoUser.user.identities)).toBe(false);
  });
  it("returns true if a user has the IDM Cognito identity attribute", () => {
    expect(isIDM(testStateIDMUser.user.identities)).toBe(true);
    expect(isIDM(testCMSIDMUser.user.identities)).toBe(true);
  });
});
