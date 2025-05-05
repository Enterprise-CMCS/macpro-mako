import { defaultCMSUser, helpDeskUser, reviewer, stateSubmitter, superReviewer } from "mocks";
import type { FullUser } from "shared-types";
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

describe("isCmsUser", () => {
  it("returns true for CMS users", () => {
    expect(isCmsUser(helpDeskUser as FullUser)).toEqual(true);
    expect(isCmsUser(defaultCMSUser as FullUser)).toEqual(true);
    expect(isCmsUser(reviewer as FullUser)).toEqual(true);
    expect(isCmsUser(superReviewer as FullUser)).toEqual(true);
  });
  it("returns false for State users", () => {
    expect(isCmsUser(stateSubmitter as FullUser)).toEqual(false);
  });
});

describe("isCmsWriteUser", () => {
  it("returns true for CMS Write users", () => {
    expect(isCmsWriteUser(reviewer as FullUser)).toEqual(true);
    expect(isCmsWriteUser(defaultCMSUser as FullUser)).toEqual(true);
  });
  it("returns false for CMS Read-Only users", () => {
    expect(isCmsWriteUser(helpDeskUser as FullUser)).toEqual(false);
  });
  it("returns false for State users", () => {
    expect(isCmsWriteUser(stateSubmitter as FullUser)).toEqual(false);
  });
});

describe("isCmsReadonlyUser", () => {
  it("returns false for CMS Write users", () => {
    expect(isCmsReadonlyUser(reviewer as FullUser)).toEqual(false);
  });
  it("returns true for CMS Read-Only users", () => {
    expect(isCmsReadonlyUser(helpDeskUser as FullUser)).toEqual(true);
  });
  it("returns false for State users", () => {
    expect(isCmsReadonlyUser(stateSubmitter as FullUser)).toEqual(false);
  });
});

describe("isStateUser", () => {
  it("returns false for CMS Write users", () => {
    expect(isStateUser(reviewer as FullUser)).toEqual(false);
  });
  it("returns false for CMS Read-Only users", () => {
    expect(isStateUser(defaultCMSUser as FullUser)).toEqual(false);
    expect(isStateUser(helpDeskUser as FullUser)).toEqual(false);
  });
  it("returns true for State users", () => {
    expect(isStateUser(stateSubmitter as FullUser)).toEqual(true);
  });
  // Maybe we should refactor to eliminate this
  it("returns false for null args", () => {
    expect(isStateUser(null)).toBe(false);
  });
});

describe("isCmsSuperUser", () => {
  it("returns false because there is no longer a CMS Super User role", () => {
    expect(isCmsSuperUser(superReviewer as FullUser)).toEqual(false);
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
