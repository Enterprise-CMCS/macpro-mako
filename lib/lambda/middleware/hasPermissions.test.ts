import { zodValidator } from "@dannywrayuk/middy-zod-validator";
import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyEventHeaders, Context } from "aws-lambda";
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
import { FullUser } from "shared-types";
import { main } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { canViewPackage, canViewUser } from "./hasPermissions";
import { storeAuthUserInRequest } from "./utils";

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
    }: { user?: FullUser; packageResult?: main.ItemResult } = {}) =>
      middy()
        .use(
          httpErrorHandler({
            fallbackMessage: JSON.stringify({ message: "Internal server error" }),
          }),
        )
        .use(httpJsonBodyParser())
        .use(
          zodValidator({
            eventSchema: z
              .object({
                body: z
                  .object({
                    id: z.string(),
                  })
                  .strict(),
              })
              .passthrough(),
          }),
        )
        .before(async (request: Request) => {
          if (user) {
            storeAuthUserInRequest(user, request, false);
          }
        })
        .use(canViewPackage())
        .handler(() => ({
          statusCode: 200,
          body: "OK",
        }));

    it("should not throw an error if the state user has permissions", async () => {
      const event = {
        body: JSON.stringify({ id: TEST_ITEM_ID }),
        headers: {
          "Content-Type": "application/json",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent;

      const handler = setupHandler({ user: TEST_STATE_USER });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual("OK");
    });

    it("should not throw an error if the user is a CMS user", async () => {
      const event = {
        body: JSON.stringify({ id: TEST_ITEM_ID }),
        headers: {
          "Content-Type": "application/json",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent;

      const handler = setupHandler({ user: TEST_CMS_USER });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual("OK");
    });

    it("should return 500 if the user is not set", async () => {
      const event = {
        body: JSON.stringify({ id: TEST_ITEM_ID }),
        headers: {
          "Content-Type": "application/json",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent;

      const handler = setupHandler();

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
    });

    it("should return 400 if the package is not set", async () => {
      const event = {
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent;

      const handler = setupHandler({ user: TEST_STATE_USER });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        JSON.stringify({
          message: "Event failed validation",
          error: [
            {
              code: "invalid_type",
              expected: "string",
              received: "undefined",
              path: ["body", "id"],
              message: "Required",
            },
          ],
        }),
      );
    });

    it("should return 403 if the state user has does not have permissions for the state of the package", async () => {
      const event = {
        body: JSON.stringify({ id: HI_TEST_ITEM_ID }),
        headers: {
          "Content-Type": "application/json",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent;

      const handler = setupHandler({ user: TEST_STATE_USER });

      const res = await handler(event, {} as Context);

      expect(res).toBeTruthy();
      expect(res.statusCode).toEqual(403);
      expect(res.body).toEqual(JSON.stringify({ message: "Not authorized to view this resource" }));
    });
  });

  describe("canViewUser", () => {
    const setupHandler = ({ user = undefined }: { user?: FullUser } = {}) =>
      middy()
        .use(
          httpErrorHandler({
            fallbackMessage: JSON.stringify({ message: "Internal server error" }),
          }),
        )
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
