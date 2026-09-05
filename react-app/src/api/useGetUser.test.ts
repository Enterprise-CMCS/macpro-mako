import {
  CMS_ROLE_APPROVER_USER,
  cmsRoleApprover,
  defaultCMSUser,
  errorApiUserDetailsHandler,
  setMockUsername,
  TEST_STATE_SUBMITTER_USER,
  testStateSubmitter,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { getUser } from "./useGetUser";

describe("getUser", () => {
  it("distinguishes users without `isCMS` property", async () => {
    setMockUsername(testStateSubmitter);
    const user = await getUser();
    expect(user.isCms).toBeFalsy();
  });
  it("distinguishes users with `isCms` property", async () => {
    setMockUsername(defaultCMSUser);
    const user = await getUser();
    expect(user.isCms).toBeTruthy();
  });
  it("returns an object of CognitoUserAttributes", async () => {
    setMockUsername(testStateSubmitter);
    const oneMacUser = await getUser();
    expect(oneMacUser.user).toStrictEqual(TEST_STATE_SUBMITTER_USER);
  });
  it("handles a user with no 'custom:cms-roles'", async () => {
    setMockUsername(cmsRoleApprover);
    const oneMacUser = await getUser();
    expect(oneMacUser.user).toStrictEqual(CMS_ROLE_APPROVER_USER);
  });

  it("keeps an authenticated Cognito session when user details are missing", async () => {
    setMockUsername(testStateSubmitter);
    mockedServer.use(errorApiUserDetailsHandler);

    const oneMacUser = await getUser();

    expect(oneMacUser.user).toEqual(
      expect.objectContaining({
        email: TEST_STATE_SUBMITTER_USER.email,
        role: "norole",
        states: [],
      }),
    );
    expect(oneMacUser.user).not.toBeNull();
  });
});
