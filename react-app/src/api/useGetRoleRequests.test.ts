import {
  CMS_ROLE_APPROVER_EMAIL,
  cmsRoleApprover,
  errorApiGetRoleRequestsHandler,
  HELP_DESK_EMAIL,
  helpDeskUser,
  osStateSystemAdmin,
  roleDocs,
  setMockUsername,
  SYSTEM_ADMIN_EMAIL,
  systemAdmin,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { getRoleRequests } from "./useGetRoleRequests";

describe("useGetRoleRequests", () => {
  it("should return all the role requests except for the current user for systemadmin", async () => {
    setMockUsername(systemAdmin);
    const result = await getRoleRequests();
    // remove the systemAdmin roles
    const filteredRoles = roleDocs.filter((roleObj) => roleObj?.email !== SYSTEM_ADMIN_EMAIL);
    expect(result.length).toEqual(filteredRoles.length);
  });
  it("should return all the role requests except for the current user for helpdesk", async () => {
    setMockUsername(helpDeskUser);
    const result = await getRoleRequests();
    // remove the helpDesk roles
    const filterRoles = roleDocs.filter((roleObj) => roleObj?.email !== HELP_DESK_EMAIL);
    expect(result.length).toEqual(filterRoles.length);
  });
  it("should return all the role requests except for the cmsroleapprovers, systemadmins, and the current user for cmsRoleApprover", async () => {
    setMockUsername(cmsRoleApprover);
    const result = await getRoleRequests();
    // remove the cmsRoleApprover roles
    const filteredRoles = roleDocs.filter(
      (roleObj) =>
        !["cmsroleapprover", "systemadmin"].includes(roleObj?.role) &&
        roleObj?.email !== CMS_ROLE_APPROVER_EMAIL,
    );
    expect(result.length).toEqual(filteredRoles.length);
  });
  it("should return the state submitters for the state of the osStateSystemAdmin", async () => {
    setMockUsername(osStateSystemAdmin);
    const result = await getRoleRequests();
    expect(result).toEqual([
      {
        id: "statesubmitter@nightwatch.test_MD_statesubmitter",
        eventType: "legacy-user-role",
        email: "statesubmitter@nightwatch.test",
        doneByEmail: "statesystemadmin@nightwatch.test",
        doneByName: "Test Again",
        status: "active",
        role: "statesubmitter",
        territory: "MD",
        lastModifiedDate: 1617149287000,
        fullName: "Statesubmitter Nightwatch",
      },
      {
        id: "mako.stateuser@gmail.com_MD_statesubmitter",
        eventType: "user-role",
        email: "mako.stateuser@gmail.com",
        doneByEmail: "statesystemadmin@nightwatch.test",
        doneByName: "Test Again",
        status: "active",
        role: "statesubmitter",
        territory: "MD",
        lastModifiedDate: 1745244568866,
        fullName: "Stateuser Tester",
      },
      {
        id: "multistate@example.com_MD_statesubmitter",
        eventType: "user-role",
        email: "multistate@example.com",
        doneByEmail: "statesystemadmin@nightwatch.test",
        doneByName: "Test Again",
        status: "active",
        role: "statesubmitter",
        territory: "MD",
        lastModifiedDate: 1745234449866,
        fullName: "Multi State",
      },
    ]);
  });

  it("should return an empty array if there is an error", async () => {
    mockedServer.use(errorApiGetRoleRequestsHandler);
    const result = await getRoleRequests();
    expect(result).toEqual([]);
  });
});
