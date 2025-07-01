import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, Context } from "aws-lambda";
import { TEST_ITEM_ID, TEST_SPA_ITEM_RAI_ID } from "mocks";
import items from "mocks/data/items";
import { main } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { fetchAppkChildren } from "./fetchAppkChildren";
import { getPackage, setPackage } from "./utils";

const setupDefault = { user: undefined, packageResult: undefined, setToContext: false };
const setup = (opts: { packageResult?: main.ItemResult; setToContext?: boolean } = {}) => {
  const options = { ...setupDefault, ...opts };

  return {
    before: async (request: Request) => {
      if (options.packageResult) {
        setPackage(options.packageResult, request, options.setToContext);
      }
    },
  };
};

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
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(setup({ packageResult }))
      .use(fetchAppkChildren())
      .before(async (request: Request) => {
        const updatedPackage = await getPackage(request);
        expect(updatedPackage).toEqual(expectedPackage);
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    await handler(event, {} as Context);
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
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(setup({ packageResult }))
      .use(fetchAppkChildren({ setToContext: true }))
      .before(async (request: Request) => {
        const updatedPackage = await getPackage(request);
        expect(updatedPackage).toEqual(expectedPackage);
      })
      .handler((event: APIGatewayEvent, context: Context & { packageResult: main.ItemResult }) => {
        const { packageResult } = context;
        expect(packageResult).toEqual(expectedPackage);
        return {
          statusCode: 200,
          body: "OK",
        };
      });

    await handler(event, {} as Context);
  });

  it("should not add appkChildren if the package does not have them", async () => {
    const packageResult = items[TEST_ITEM_ID] as main.ItemResult;
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(setup({ packageResult }))
      .use(fetchAppkChildren())
      .before(async (request: Request) => {
        const updatedPackage = await getPackage(request);
        expect(updatedPackage).toEqual(packageResult);
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    await handler(event, {} as Context);
  });

  it("should return 500, if there is no package stored internally", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(setup())
      .use(fetchAppkChildren())
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 500, if the package does not have an id", async () => {
    const packageResult = items[TEST_SPA_ITEM_RAI_ID] as main.ItemResult;
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(
        setup({
          packageResult: {
            ...packageResult,
            // @ts-ignore making this invalid for testing
            _id: undefined,
          },
        }),
      )
      .use(fetchAppkChildren())
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
