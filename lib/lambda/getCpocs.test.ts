import { APIGatewayEvent } from "aws-lambda";
import { emptyOSCpocSearchHandler, errorOSCpocSearchHandler } from "mocks";
import { cpocsList } from "mocks/data/cpocs";
import { mockedServiceServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { handler } from "./getCpocs";

describe("getCpocs Handler", () => {
  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  // TODO - should this be removed? when will the result be empty and not
  // just a result with an empty hit array
  it("should return 400 if no Cpocs are found", async () => {
    mockedServiceServer.use(emptyOSCpocSearchHandler);

    const event = { body: JSON.stringify({}) } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "No Cpocs found" }));
  });

  it("should return 200 with the result if Cpocs are found", async () => {
    const event = { body: JSON.stringify({}) } as APIGatewayEvent;

    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(body.hits.hits).toEqual(cpocsList);
  });

  it("should return 500 if an error occurs during processing", async () => {
    mockedServiceServer.use(errorOSCpocSearchHandler);

    const event = { body: JSON.stringify({}) } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
