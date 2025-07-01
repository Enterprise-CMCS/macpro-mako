import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyEventHeaders, Context } from "aws-lambda";
import { GET_ERROR_ITEM_ID, NOT_FOUND_ITEM_ID, TEST_ITEM_ID } from "mocks";
import items from "mocks/data/items";
import { main } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { fetchPackage } from "./fetchPackage";
import { getPackage } from "./utils";

describe("fetchPackage", () => {
  it("should return 500, if there is an error retrieving the package", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = middy().use(httpErrorHandler()).use(httpJsonBodyParser()).use(fetchPackage());

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should store an undefined package if there is an error retrieving the package and allowNotFound is true", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = middy()
      .use(httpErrorHandler())
      .use(httpJsonBodyParser())
      .use(fetchPackage({ allowNotFound: true }))
      .before(async (request: Request) => {
        const packageResult = await getPackage(request);
        expect(packageResult).toBeUndefined();
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should return 404, if the package is not found", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = middy().use(httpErrorHandler()).use(httpJsonBodyParser()).use(fetchPackage());

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual(JSON.stringify({ message: "No record found for the given id" }));
  });

  it("should store an undefined package if the package is not found and allowNotFound is true", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = middy()
      .use(httpErrorHandler())
      .use(httpJsonBodyParser())
      .use(fetchPackage({ allowNotFound: true }))
      .before(async (request: Request) => {
        const packageResult = await getPackage(request);
        expect(packageResult).toBeUndefined();
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should store the package only internally if setToContext is true", async () => {
    const event = {
      body: JSON.stringify({ id: TEST_ITEM_ID }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const expectedItem = items[TEST_ITEM_ID];
    const handler = middy()
      .use(httpErrorHandler())
      .use(httpJsonBodyParser())
      .use(fetchPackage({ setToContext: true }))
      .before(async (request: Request) => {
        const packageResult = await getPackage(request);
        expect(packageResult).toEqual(expectedItem);
      })
      .handler(
        async (event: APIGatewayEvent, context: Context & { packageResult?: main.ItemResult }) => {
          const { packageResult } = context;
          expect(packageResult).toEqual(expectedItem);
          return {
            statusCode: 200,
            body: "OK",
          };
        },
      );

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });
});
