import type { CognitoUserAttributes } from "shared-types";
import { describe, expect, it } from "vitest";

import {
  canRequestAccess,
  canUpdateAccess,
  isCmsReadonlyUser,
  isCmsSuperUser,
  isCmsUser,
  isCmsWriteUser,
  isIDM,
  isStateUser,
} from ".";
import {
  testCMSCognitoUser,
  testCMSIDMUser,
  testStateCognitoUser,
  testStateIDMUser,
} from "./testData";

type User = CognitoUserAttributes;
const cmsHelpDeskUser = {
  ...testCMSCognitoUser.user,
  "custom:cms-roles": "onemac-helpdesk",
};
const cmsReadOnlyUser = {
  ...testCMSCognitoUser.user,
  "custom:cms-roles": "onemac-micro-readonly",
};
const cmsReviewerUser = {
  ...testCMSCognitoUser.user,
  "custom:ismemberof": "ONEMAC_USER_D",
};
const cmsSuperUser = {
  ...testCMSCognitoUser.user,
  "custom:ismemberof": "ONEMAC_USER_D_SUPER",
  sub: testCMSCognitoUser?.user?.sub || "",
  // Add other required properties with default values if needed
};
const stateSubmitterUser = testStateCognitoUser.user;

describe("isCmsUser", () => {
  it("returns true for CMS users", () => {
    expect(isCmsUser(cmsHelpDeskUser as User)).toEqual(true);
    expect(isCmsUser(cmsReadOnlyUser as User)).toEqual(true);
    expect(isCmsUser(cmsReviewerUser as User)).toEqual(true);
    expect(isCmsUser(cmsSuperUser as User)).toEqual(true);
  });
  it("returns false for State users", () => {
    expect(isCmsUser(stateSubmitterUser as User)).toEqual(false);
  });
});

describe("isCmsWriteUser", () => {
  it("returns true for CMS Write users", () => {
    expect(isCmsWriteUser(cmsReviewerUser as User)).toEqual(true);
  });
  it("returns false for CMS Read-Only users", () => {
    expect(isCmsWriteUser(cmsReadOnlyUser as User)).toEqual(false);
    expect(isCmsWriteUser(cmsHelpDeskUser as User)).toEqual(false);
  });
  it("returns false for State users", () => {
    expect(isCmsWriteUser(stateSubmitterUser as User)).toEqual(false);
  });
});

describe("isCmsReadonlyUser", () => {
  it("returns false for CMS Write users", () => {
    expect(isCmsReadonlyUser(cmsReviewerUser as User)).toEqual(false);
  });
  it("returns true for CMS Read-Only users", () => {
    expect(isCmsReadonlyUser(cmsReadOnlyUser as User)).toEqual(true);
    expect(isCmsReadonlyUser(cmsHelpDeskUser as User)).toEqual(true);
  });
  it("returns false for State users", () => {
    expect(isCmsReadonlyUser(stateSubmitterUser as User)).toEqual(false);
  });
});

describe("isStateUser", () => {
  it("returns false for CMS Write users", () => {
    expect(isStateUser(cmsReviewerUser as User)).toEqual(false);
  });
  it("returns false for CMS Read-Only users", () => {
    expect(isStateUser(cmsReadOnlyUser as User)).toEqual(false);
    expect(isStateUser(cmsHelpDeskUser as User)).toEqual(false);
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
    expect(isCmsSuperUser(cmsSuperUser as User)).toEqual(true);
  });
});

describe("isIDM", () => {
  it("returns false if a user has no Cognito identities", () => {
    expect(isIDM(testStateCognitoUser.user)).toBe(false);
    expect(isIDM(testCMSCognitoUser.user)).toBe(false);
  });
  it("returns true if a user has the IDM Cognito identity attribute", () => {
    expect(isIDM(testStateIDMUser.user)).toBe(true);
    expect(isIDM(testCMSIDMUser.user)).toBe(true);
  });
});

describe("canUpdateAccess", () => {
  it("should return false if the currentUserRole is not allowed to update roles", () => {
    expect(canUpdateAccess("statesubmitter", "statesystemadmin")).toBeFalsy();
  });

  it("should return false if the currentUserRole is not allowed to update the roleToUpdate", () => {
    expect(canUpdateAccess("statesystemadmin", "helpdesk")).toBeFalsy();
  });

  it("should return true if the currentUserRole is allowed to update the roleToUpdate", () => {
    expect(canUpdateAccess("systemadmin", "helpdesk")).toBeTruthy();
  });
});

describe("canRequestAccess", () => {
  it("should return false if the role is not allowed to request access", () => {
    expect(canRequestAccess("cmsreviewer")).toBeFalsy();
  });
  it("should return true if the role is allowed to request access", () => {
    expect(canRequestAccess("statesubmitter")).toBeTruthy();
  });
});
