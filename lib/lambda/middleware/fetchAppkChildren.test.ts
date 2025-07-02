import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, Context } from "aws-lambda";
import { TEST_ITEM_ID, TEST_SPA_ITEM_RAI_ID } from "mocks";
import items from "mocks/data/items";
import { main } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { fetchAppkChildren, FetchAppkChildrenOptions } from "./fetchAppkChildren";
import { getPackage, setPackage } from "./utils";

const setupHandler = ({
  packageResult = undefined,
  expectedPackage = undefined,
  options = { setToContext: false },
}: {
  packageResult?: main.ItemResult;
  expectedPackage?: main.ItemResult;
  options?: FetchAppkChildrenOptions;
} = {}) =>
  middy()
    .use(httpErrorHandler())
    .before(async (request: Request) => {
      if (packageResult) {
        setPackage(packageResult, request, options.setToContext);
      }
    })
    .use(fetchAppkChildren(options))
    .before(async (request: Request) => {
      const updatedPackage = await getPackage(request);
      expect(updatedPackage).toEqual(expectedPackage);
    })
    .handler((event: APIGatewayEvent, context: Context & { packageResult?: main.ItemResult }) => {
      if (options.setToContext) {
        const { packageResult } = context;
        expect(packageResult).toEqual(expectedPackage);
      }

      return {
        statusCode: 200,
        body: "OK",
      };
    });

describe("fetchAppkChildren", () => {
  it("should internally store the Appk children in the package if it has them", async () => {
    const expectedPackage = items[TEST_SPA_ITEM_RAI_ID] as main.ItemResult;
    const packageResult = {
      ...expectedPackage,
      _source: {
        ...expectedPackage._source,
        appkChildren: undefined,
      },
    };

    const handler = setupHandler({ packageResult, expectedPackage });

    await handler({} as APIGatewayEvent, {} as Context);
  });

  it("should store the Appk children in the package internally and in the context if it has them", async () => {
    const expectedPackage = items[TEST_SPA_ITEM_RAI_ID] as main.ItemResult;
    const packageResult = {
      ...expectedPackage,
      _source: {
        ...expectedPackage._source,
        appkChildren: undefined,
      },
    };

    const handler = setupHandler({
      packageResult,
      expectedPackage,
      options: { setToContext: true },
    });

    await handler({} as APIGatewayEvent, {} as Context);
  });

  it("should not add appkChildren if the package does not have them", async () => {
    const packageResult = items[TEST_ITEM_ID] as main.ItemResult;

    const handler = setupHandler({ packageResult, expectedPackage: packageResult });

    await handler({} as APIGatewayEvent, {} as Context);
  });
});
