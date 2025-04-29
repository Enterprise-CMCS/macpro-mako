import { APIGatewayEvent } from "aws-lambda";
import {
  errorRoleSearchHandler,
  getRequestContext,
  mockedProducer,
  readOnlyUser,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "./submitGroupDivision";

describe("submitGroupDivision handler", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    process.env.topicName = "submit-group-division";
  });

  it("should return 400 if the event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should throw an error if the topicName is not set", async () => {
    delete process.env.topicName;

    const event = {
      body: JSON.stringify({
        group: "Group1",
        division: "Division1",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Internal Server Error: Topic name is not defined" }),
    );
  });

  it("should return a 403 if the user is not a CMS user", async () => {
    const event = {
      body: JSON.stringify({
        group: "Group1",
        division: "Division1",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not a default CMS user" }));
  });

  it("should return a 200 if the group and division were submitted successfully", async () => {
    mockedProducer.send.mockResolvedValueOnce([{ message: "sent" }]);
    setMockUsername(readOnlyUser);

    const event = {
      body: JSON.stringify({
        group: "Group1",
        division: "Division1",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Group and division submitted successfully." }),
    );
  });

  it("should return a 500 if there is an error", async () => {
    mockedServer.use(errorRoleSearchHandler);
    setMockUsername(readOnlyUser);

    const event = {
      body: JSON.stringify({
        group: "Group1",
        division: "Division1",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal Server Error: Response Error" }));
  });
});
