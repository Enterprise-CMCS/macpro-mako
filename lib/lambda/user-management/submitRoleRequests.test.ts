import { APIGatewayEvent } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  helpDeskUser,
  mockedProducer,
  multiStateSubmitter,
  noStateSubmitter,
  osStateSystemAdmin,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { canRequestAccess, canUpdateAccess, handler } from "./submitRoleRequests";

describe("submitRoleRequests", () => {
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

  describe("submitRoleRequests handler", () => {
    beforeEach(() => {
      setDefaultStateSubmitter();
      process.env.topicName = "request-role";
    });

    it("should return 400 if the event body is missing", async () => {
      const event = {} as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
    });

    it("should return 400 if the request context is missing", async () => {
      // @ts-ignore
      const event = {
        body: {},
      } as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(JSON.stringify({ message: "Request context required" }));
    });

    it("should throw an error if the topicName is not set", async () => {
      delete process.env.topicName;

      const event = {
        body: {},
        requestContext: getRequestContext(),
      } as APIGatewayEvent;

      expect(() => handler(event)).rejects.toThrowError("Topic name is not defined");
    });

    it("should return 401 if the user is not authenticated", async () => {
      setMockUsername(null);

      const event = {
        body: {},
        requestContext: getRequestContext(),
      } as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual(JSON.stringify({ message: "User not authenticated" }));
    });

    it("should return 403 if the user does not have an active role", async () => {
      setMockUsername(noStateSubmitter);

      const event = {
        body: {},
        requestContext: getRequestContext(),
      } as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toEqual(JSON.stringify({ message: "No active role found for user" }));
    });

    it("should return 400 if the grantAccess is missing", async () => {
      setMockUsername(osStateSystemAdmin);
      // @ts-ignore
      const event = {
        body: {
          email: "nostate@example.com",
          state: "MD",
          role: "statesubmitter",
          eventType: "user-role",
        },
        requestContext: getRequestContext(),
      } as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual(
        JSON.stringify({ message: "Invalid or missing grantAccess value." }),
      );
    });

    it("should return 200 if the user is allowed to update the access", async () => {
      mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
      setMockUsername(osStateSystemAdmin);
      // @ts-ignore
      const event = {
        body: {
          email: "nostate@example.com",
          state: "MD",
          role: "statesubmitter",
          eventType: "user-role",
          grantAccess: true,
          requestRoleChange: false,
        },
        requestContext: getRequestContext(),
      } as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(
        JSON.stringify({ message: "Request to access MD has been submitted." }),
      );
    });

    it("should return 200 if the user is allowed to request access", async () => {
      mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
      setMockUsername(multiStateSubmitter);
      // @ts-ignore
      const event = {
        body: {
          email: "multistate@example.com",
          state: "CO",
          role: "statesubmitter",
          eventType: "user-role",
          grantAccess: true,
          requestRoleChange: true,
        },
        requestContext: getRequestContext(),
      } as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(
        JSON.stringify({ message: "Request to access CO has been submitted." }),
      );
    });

    it("should return 403 if the currentUserRole cannot request updates", async () => {
      setMockUsername(helpDeskUser);
      // @ts-ignore
      const event = {
        body: {
          email: "helpdesk@example.com",
          state: "MD",
          role: "defaultcmsuser",
          eventType: "user-role",
          grantAccess: true,
        },
        requestContext: getRequestContext(),
      } as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toEqual(
        JSON.stringify({ message: "You are not authorized to perform this action." }),
      );
    });

    it("should return 500 if there is an error", async () => {
      mockedServer.use(errorRoleSearchHandler);
      setMockUsername(multiStateSubmitter);
      // @ts-ignore
      const event = {
        body: {
          email: "multistate@example.com",
          state: "CO",
          role: "statesubmitter",
          eventType: "user-role",
          grantAccess: true,
        },
        requestContext: getRequestContext(),
      } as APIGatewayEvent;

      const res = await handler(event);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
    });
  });
});
