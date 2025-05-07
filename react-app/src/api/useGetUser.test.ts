import {
  cmsRoleApprover,
  defaultCMSUser,
  makoStateSubmitter,
  setMockUsername,
  TEST_CMS_ROLE_APPROVER_USER,
  TEST_STATE_SUBMITTER_USER,
} from "mocks";
import { describe, expect, it } from "vitest";

import { getUser } from "./useGetUser";
import { getUserDetails } from "./useGetUserDetails";

describe("getUser", () => {
  it("distinguishes users without `isCMS` property", async () => {
    setMockUsername(makoStateSubmitter);
    const user = await getUser();
    expect(user.isCms).toBeFalsy();
  });
  it("distinguishes users with `isCms` property", async () => {
    setMockUsername(defaultCMSUser);
    const user = await getUser();
    expect(user.isCms).toBeTruthy();
  });
  it("returns an object of CognitoUserAttributes", async () => {
    setMockUsername(makoStateSubmitter);
    const oneMacUser = await getUser();
    expect(oneMacUser.user).toStrictEqual(TEST_STATE_SUBMITTER_USER);
  });
  it("handles a user with no 'custom:cms-roles'", async () => {
    setMockUsername(cmsRoleApprover);
    const oneMacUser = await getUser();
    expect(oneMacUser.user).toStrictEqual(TEST_CMS_ROLE_APPROVER_USER);
  });
});
