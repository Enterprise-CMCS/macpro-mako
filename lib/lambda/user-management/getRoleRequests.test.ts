import { APIGatewayEvent } from "aws-lambda";
import {
  cmsRoleApprover,
  errorRoleSearchHandler,
  getRequestContext,
  helpDeskUser,
  noStateSubmitter,
  osStateSystemAdmin,
  roleDocs,
  setDefaultStateSubmitter,
  setMockUsername,
  systemAdmin,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./getRoleRequests";

describe("getRoleRequests", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
  });

  it("should return 400 if the request context is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Request context required" }));
  });

  it("should return 401 if user isn't authenticated", async () => {
    setMockUsername(null);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User not authenticated" }));
  });

  it("should return 403 if user doesn't have roles", async () => {
    setMockUsername(noStateSubmitter);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(JSON.stringify({ message: "User not authorized to approve roles" }));
  });

  it("should return 403 if the user is a state submitter", async () => {
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(JSON.stringify({ message: "User not authorized to approve roles" }));
  });

  it("should return 200 and get all role requests if user is a System Admin", async () => {
    setMockUsername(systemAdmin);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    const roles = JSON.parse(res.body);
    expect(roles.length).toEqual(roleDocs.length - 1); // remove the systemAdmin user
  });

  it("should return 200 and get all role requests if user is a Help Desk User", async () => {
    setMockUsername(helpDeskUser);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    const roles = JSON.parse(res.body);
    expect(roles.length).toEqual(roleDocs.length - 1); // remove the systemAdmin user
  });

  it("should return 200 and get all state role requests if user is a CMS role approver", async () => {
    setMockUsername(cmsRoleApprover);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    const roles = JSON.parse(res.body);
    const expectedRoles = roleDocs.filter(
      (role) => !["cmsroleapprover", "systemadmin"].includes(role?.role),
    );
    expect(roles.length).toEqual(expectedRoles.length);
  });

  it("should return 200 and get corresponding state role requests if user is a state system admin", async () => {
    setMockUsername(osStateSystemAdmin);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify([
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
      ]),
    );
  });

  it("should return 500 if there is an error getting the roles", async () => {
    mockedServer.use(errorRoleSearchHandler);
    setMockUsername(osStateSystemAdmin);
    const event = {
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
