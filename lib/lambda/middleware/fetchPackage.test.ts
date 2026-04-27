import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, APIGatewayProxyEventHeaders, Context } from "aws-lambda";
import * as packageApi from "libs/api/package";
import { GET_ERROR_ITEM_ID, NOT_FOUND_ITEM_ID, TEST_ITEM_ID } from "mocks";
import items from "mocks/data/items";
import { main } from "shared-types/opensearch";
import { describe, expect, it, vi } from "vitest";

import { fetchPackage, FetchPackageOptions } from "./fetchPackage";
import { ContextWithPackage, getPackageFromRequest } from "./utils";

const setupHandler = ({
  expectedPackage = undefined,
  options = {
    allowNotFound: false,
    setToContext: false,
  },
}: {
  expectedPackage?: main.ItemResult;
  options?: FetchPackageOptions;
} = {}) =>
  middy()
    .use(
      httpErrorHandler({ fallbackMessage: JSON.stringify({ message: "Internal server error" }) }),
    )
    .use(httpJsonBodyParser())
    .use(fetchPackage(options))
    .before(async (request: Request) => {
      const packageResult = await getPackageFromRequest(request);
      expect(packageResult).toEqual(expectedPackage);
    })
    .handler((event: APIGatewayEvent, context: ContextWithPackage) => {
      if (options.setToContext) {
        const { packageResult } = context;
        expect(packageResult).toEqual(expectedPackage);
      }
      return {
        statusCode: 200,
        body: "OK",
      };
    });

describe("fetchPackage", () => {
  it("should return 500, if there is an error retrieving the package", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
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

  it("should store an undefined package if there is an error retrieving the package and allowNotFound is true", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = setupHandler({ options: { allowNotFound: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should return 500, if there is an error retrieving the package and allowNotFound is false", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
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

  it("should return 404, if the package is not found", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = setupHandler();

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

    const handler = setupHandler({ options: { allowNotFound: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should store the package internally and in the context if setToContext is true", async () => {
    const event = {
      body: JSON.stringify({ id: TEST_ITEM_ID }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;
    const expectedPackage = items[TEST_ITEM_ID] as main.ItemResult;

    const handler = setupHandler({ expectedPackage, options: { setToContext: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
  });

  it("should treat malformed main shell docs as not found when allowNotFound is true", async () => {
    const event = {
      body: JSON.stringify({ id: "MD-26-9100-P" }),
      headers: {
        "Content-Type": "application/json",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const getPackageSpy = vi.spyOn(packageApi, "getPackage").mockResolvedValueOnce({
      found: true,
      _id: "MD-26-9100-P",
      _source: {
        id: "MD-26-9100-P",
        changedDate: "2026-04-27T19:56:38.000Z",
      },
    } as any);

    const handler = setupHandler({ options: { allowNotFound: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
    getPackageSpy.mockRestore();
  });
});
