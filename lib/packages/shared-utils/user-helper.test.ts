import { describe, it, vi, expect } from "vitest";
import {
  isCmsReadonlyUser,
  isCmsUser,
  isCmsWriteUser,
  isIDM,
  isStateUser,
  isCmsSuperUser,
} from ".";
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
const cmsSuperUser: CognitoUserAttributes = {
  ...testCMSCognitoUser.user,
  "custom:cms-roles": "onemac-micro-super",
};
const stateSubmitterUser: CognitoUserAttributes = testStateCognitoUser.user;

describe("isCmsUser", () => {
  it("returns true for CMS users", () => {
    expect(isCmsUser(cmsHelpDeskUser)).toEqual(true);
    expect(isCmsUser(cmsReadOnlyUser)).toEqual(true);
    expect(isCmsUser(cmsReviewerUser)).toEqual(true);
    expect(isCmsUser(cmsSuperUser)).toEqual(true);
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
  it("returns false for CMS Read-Only users", () => {
    expect(isStateUser(cmsReadOnlyUser)).toEqual(false);
    expect(isStateUser(cmsHelpDeskUser)).toEqual(false);
  });
  it("returns true for State users", () => {
    expect(isStateUser(stateSubmitterUser)).toEqual(true);
  });
  // Maybe we should refactor to eliminate this
  it("returns false for null args", () => {
    expect(isStateUser(null)).toBe(false);
  });
});

describe("isCmsSuperUser", () => {
  it("returns true for CMS Super Users", () => {
    expect(isCmsSuperUser(cmsSuperUser)).toEqual(true);
  });
});

describe("isIDM", () => {
  const consoleErrorSpy = vi.spyOn(console, "error");
  it("returns false if a user has no Cognito identities", () => {
    expect(isIDM(testStateCognitoUser.user)).toBe(false);
    expect(isIDM(testCMSCognitoUser.user)).toBe(false);
  });
  it("returns true if a user has the IDM Cognito identity attribute", () => {
    expect(isIDM(testStateIDMUser.user)).toBe(true);
    expect(isIDM(testCMSIDMUser.user)).toBe(true);
  });
});
