import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, Context } from "aws-lambda";
import {
  getFilteredRoleDocsByEmail,
  HI_TEST_ITEM_ID,
  osUsers,
  TEST_ITEM_ID,
  TEST_REVIEWER_EMAIL,
  TEST_REVIEWER_USER,
  TEST_STATE_SUBMITTER_EMAIL,
  TEST_STATE_SUBMITTER_USER,
} from "mocks";
import items from "mocks/data/items";
import { main, roles, users } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { canViewPackage } from "./hasPermissions";
import { MiddyUser, storePackageInRequest, storeUserInRequest } from "./utils";

const TEST_ITEM = items[TEST_ITEM_ID] as main.ItemResult;
const HI_TEST_ITEM = items[HI_TEST_ITEM_ID] as main.ItemResult;
const stateUserProfile =
  (getFilteredRoleDocsByEmail(TEST_STATE_SUBMITTER_EMAIL) as roles.Document[]) || [];
const states: string[] = Array.from(
  new Set(
    stateUserProfile
      .filter((role) => role.status === "active")
      .map((role) => role.territory.toUpperCase()),
  ),
);
const TEST_STATE_USER: MiddyUser = {
  cognitoUser: {
    ...TEST_STATE_SUBMITTER_USER,
    role: "statesubmitter",
    states,
  },
  userDetails: osUsers[TEST_STATE_SUBMITTER_EMAIL]._source as users.Document,
  userProfile: stateUserProfile,
};
const cmsUserProfile = (getFilteredRoleDocsByEmail(TEST_REVIEWER_EMAIL) as roles.Document[]) || [];
const TEST_CMS_USER: MiddyUser = {
  cognitoUser: {
    ...TEST_REVIEWER_USER,
    role: "cmsreviewer",
    states: [],
  },
  userDetails: osUsers[TEST_REVIEWER_EMAIL]._source as users.Document,
  userProfile: cmsUserProfile,
};

const setupDefault = { user: undefined, packageResult: undefined };
const setupHandler = (opts: { user?: MiddyUser; packageResult?: main.ItemResult }) => {
  const options = { ...setupDefault, ...opts };

  return middy()
    .use(httpErrorHandler())
    .before(async (request: Request) => {
      if (options.user) {
        storeUserInRequest(options.user, request, false);
      }
      if (options.packageResult) {
        storePackageInRequest(options.packageResult, request, false);
      }
    })
    .use(canViewPackage())
    .handler(() => ({
      statusCode: 200,
      body: "OK",
    }));
};

describe("Permissions middleware", () => {
  describe("canViewPackage", () => {
    it("should not throw an error if the state user has permissions", async () => {
      const event = {
        body: "test",
      } as APIGatewayEvent;

      const handler = setupHandler({ user: TEST_STATE_USER, packageResult: TEST_ITEM });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual("OK");
    });

    it("should not throw an error if the user is a CMS user", async () => {
      const event = {
        body: "test",
      } as APIGatewayEvent;

      const handler = setupHandler({ user: TEST_CMS_USER, packageResult: TEST_ITEM });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual("OK");
    });
  });

  it("should return 500 if the user is not set", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({ packageResult: TEST_ITEM });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 500 if the package is not set", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({ user: TEST_STATE_USER });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 403 if the state user has does not have permissions for the state of the package", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({ user: TEST_STATE_USER, packageResult: HI_TEST_ITEM });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(JSON.stringify({ message: "Not authorized to view this resource" }));
  });
});
