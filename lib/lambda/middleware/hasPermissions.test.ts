import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, Context } from "aws-lambda";
import {
  CMS_ROLE_APPROVER_USER,
  getActiveStatesForUserByEmail,
  HI_TEST_ITEM_ID,
  OS_STATE_SYSTEM_ADMIN_EMAIL,
  TEST_ITEM_ID,
  TEST_REVIEWER_EMAIL,
  TEST_REVIEWER_USER,
  TEST_STATE_SUBMITTER_EMAIL,
  TEST_STATE_SUBMITTER_USER,
  TEST_STATE_SYSTEM_ADMIN_USER,
} from "mocks";
import items from "mocks/data/items";
import { FullUser } from "shared-types";
import { main } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { canViewPackage, canViewUser } from "./hasPermissions";
import { storeAuthUserInRequest, storePackageInRequest } from "./utils";

const TEST_ITEM = items[TEST_ITEM_ID] as main.ItemResult;
const HI_TEST_ITEM = items[HI_TEST_ITEM_ID] as main.ItemResult;

const TEST_STATE_USER: FullUser = {
  ...TEST_STATE_SUBMITTER_USER,
  role: "statesubmitter",
  states: getActiveStatesForUserByEmail(TEST_STATE_SUBMITTER_EMAIL, "statesubmitter") || [],
};

const TEST_CMS_USER: FullUser = {
  ...TEST_REVIEWER_USER,
  role: "cmsreviewer",
  states: [],
};

const TEST_STATE_ADMIN_USER: FullUser = {
  ...TEST_STATE_SYSTEM_ADMIN_USER,
  role: "statesystemadmin",
  states: getActiveStatesForUserByEmail(OS_STATE_SYSTEM_ADMIN_EMAIL, "statesystemadmin") || [],
};

const TEST_CMS_APPROVER_USER: FullUser = {
  ...CMS_ROLE_APPROVER_USER,
  role: "cmsroleapprover",
  states: [],
};

describe("Permissions middleware", () => {
  describe("canViewPackage", () => {
    const setupHandler = ({
      user = undefined,
      packageResult = undefined,
    }: { user?: FullUser; packageResult?: main.ItemResult } = {}) =>
      middy()
        .use(httpErrorHandler())
        .before(async (request: Request) => {
          if (user) {
            storeAuthUserInRequest(user, request, false);
          }
          if (packageResult) {
            storePackageInRequest(packageResult, request, false);
          }
        })
        .use(canViewPackage())
        .handler(() => ({
          statusCode: 200,
          body: "OK",
        }));

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

  describe("canViewUser", () => {
    const setupHandler = ({ user = undefined }: { user?: FullUser } = {}) =>
      middy()
        .use(httpErrorHandler())
        .before(async (request: Request) => {
          if (user) {
            storeAuthUserInRequest(user, request, false);
          }
        })
        .use(canViewUser())
        .handler(() => ({
          statusCode: 200,
          body: "OK",
        }));

    it("should not throw an error if there is no userEmail", async () => {
      const event = {
        body: {},
      } as APIGatewayEvent;

      const handler = setupHandler({ user: TEST_STATE_USER });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual("OK");
    });

    it("should not throw an error if the userEmail matches the logged in user's email", async () => {
      const event = {
        body: { userEmail: TEST_STATE_SUBMITTER_EMAIL },
      } as APIGatewayEvent & { body: { userEmail: string } };

      const handler = setupHandler({ user: TEST_STATE_USER });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual("OK");
    });

    it("should not throw an error if the user is a state system admin", async () => {
      const event = {
        body: { userEmail: TEST_STATE_SUBMITTER_EMAIL },
      } as APIGatewayEvent & { body: { userEmail: string } };

      const handler = setupHandler({ user: TEST_STATE_ADMIN_USER });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual("OK");
    });

    it("should not throw an error if the user is a CMS role approver", async () => {
      const event = {
        body: { userEmail: TEST_REVIEWER_EMAIL },
      } as APIGatewayEvent & { body: { userEmail: string } };

      const handler = setupHandler({ user: TEST_CMS_APPROVER_USER });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual("OK");
    });

    it("should return 500 if the user is not logged in", async () => {
      const event = {
        body: { userEmail: OS_STATE_SYSTEM_ADMIN_EMAIL },
      } as APIGatewayEvent & { body: { userEmail: string } };

      const handler = setupHandler();

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
    });

    it("should return 500 if the user does not have an email", async () => {
      const event = {
        body: { userEmail: OS_STATE_SYSTEM_ADMIN_EMAIL },
      } as APIGatewayEvent & { body: { userEmail: string } };

      const handler = setupHandler({
        ...TEST_STATE_ADMIN_USER,
        // @ts-ignore
        email: undefined,
      });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
    });
  });
});
