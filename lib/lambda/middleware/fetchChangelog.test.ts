import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, Context } from "aws-lambda";
import { ADMIN_ITEM_ID, EXISTING_ITEM_PENDING_ID } from "mocks";
import items from "mocks/data/items";
import { changelog, main } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { fetchChangelog } from "./fetchChangelog";
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

describe("fetchChangelog", () => {
  it("should internally store the changelog in the package if it has them", async () => {
    const expectedPackage = items[ADMIN_ITEM_ID] as main.ItemResult;
    const packageResult = {
      ...expectedPackage,
      _source: {
        ...expectedPackage._source,
        changelog: undefined,
      },
    };
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(setup({ packageResult }))
      .use(fetchChangelog())
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

  it("should only fetch changes after the legacySubmissionTimestamp if it is set", async () => {
    const initialPackage = items[ADMIN_ITEM_ID] as main.ItemResult;
    const changelog = initialPackage._source.changelog as changelog.ItemResult[];
    const legacySubmissionTimestamp = changelog[2]._source.timestamp;
    const expectedChangelog = changelog.slice(3);
    const packageResult = {
      ...initialPackage,
      _source: {
        ...initialPackage._source,
        changelog: undefined,
        legacySubmissionTimestamp,
      },
    };
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(setup({ packageResult }))
      .use(fetchChangelog())
      .before(async (request: Request) => {
        const updatedPackage = await getPackage(request);
        expect(updatedPackage).toEqual({
          ...initialPackage,
          _source: {
            ...initialPackage._source,
            legacySubmissionTimestamp,
            changelog: expectedChangelog,
          },
        });
      })
      .handler(() => ({
        statusCode: 200,
        body: "OK",
      }));

    await handler(event, {} as Context);
  });

  it("should store the changelog in the package internally and in the context if it has them", async () => {
    const expectedPackage = items[ADMIN_ITEM_ID] as main.ItemResult;
    const packageResult = {
      ...expectedPackage,
      _source: {
        ...expectedPackage._source,
        changelog: undefined,
      },
    };
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(setup({ packageResult }))
      .use(fetchChangelog({ setToContext: true }))
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

  it("should not add changelog if the package does not have them", async () => {
    const packageResult = items[EXISTING_ITEM_PENDING_ID] as main.ItemResult;
    const event = {
      body: "test",
    } as APIGatewayEvent;
    const handler = middy()
      .use(httpErrorHandler())
      .use(setup({ packageResult }))
      .use(fetchChangelog())
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
      .use(fetchChangelog())
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
    const packageResult = items[ADMIN_ITEM_ID] as main.ItemResult;
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
      .use(fetchChangelog())
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
