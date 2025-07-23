import {
  defaultCMSUser,
  errorRoleSearchHandler,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedProducer } from "mocks/helpers/kafka.utils";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./submitGroupDivision";
import * as UserManagementService from "./userManagementService";

describe("submitGroupDivision handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "submit-group-division";
  });

  it("should throw an error if the topicName is not set", async () => {
    delete process.env.topicName;

    const event = {
      body: JSON.stringify({
        userEmail: "mako.stateuser@gmail.com",
        group: "Group1",
        division: "Division1",
      }),
    };

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Internal Server Error: Topic name is not defined" }),
    );
  });

  it("should return a 200 if the group and division were submitted successfully", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(defaultCMSUser);

    const event = {
      body: JSON.stringify({
        userEmail: "mako.stateuser@gmail.com",
        group: "Group1",
        division: "Division1",
      }),
    };

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Group and division submitted successfully." }),
    );
  });

  it("should return a 404 if the user is not found", async () => {
    vi.spyOn(UserManagementService, "getUserByEmail").mockResolvedValueOnce(null);

    const event = {
      body: JSON.stringify({
        userEmail: "test@test.com",
        group: "Group1",
        division: "Division1",
      }),
    };

    const res = await handler(event);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual(
      JSON.stringify({ message: "User with email test@test.com not found." }),
    );
  });

  it("should return a 400 if the event body is missing", async () => {
    const event = {};

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return a 500 if there is an error", async () => {
    mockedServer.use(errorRoleSearchHandler);
    setMockUsername(defaultCMSUser);

    const event = {
      body: JSON.stringify({
        userEmail: "cmsroleapprover@example.com",
        group: "Group1",
        division: "Division1",
      }),
    };

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toContain("Internal Server Error");
  });
});
