import middy, { Request } from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, Context } from "aws-lambda";
import { ADMIN_ITEM_ID, EXISTING_ITEM_PENDING_ID } from "mocks";
import items from "mocks/data/items";
import { changelog, main } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { fetchChangelog, FetchChangelogOptions } from "./fetchChangelog";
import { getPackage, setPackage } from "./utils";

const setupHandler = ({
  packageResult = undefined,
  expectedPackage = undefined,
  options = {
    setToContext: false,
  },
}: {
  packageResult?: main.ItemResult;
  expectedPackage?: main.ItemResult;
  options?: FetchChangelogOptions;
} = {}) =>
  middy()
    .use(httpErrorHandler())
    .before(async (request: Request) => {
      if (packageResult) {
        setPackage(packageResult, request, options.setToContext);
      }
    })
    .use(fetchChangelog(options))
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

    const handler = setupHandler({ packageResult, expectedPackage });

    await handler({} as APIGatewayEvent, {} as Context);
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

    const handler = setupHandler({
      packageResult,
      expectedPackage: {
        ...initialPackage,
        _source: {
          ...initialPackage._source,
          // @ts-ignore
          legacySubmissionTimestamp,
          changelog: expectedChangelog,
        },
      },
    });

    await handler({} as APIGatewayEvent, {} as Context);
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

    const handler = setupHandler({
      packageResult,
      expectedPackage,
      options: { setToContext: true },
    });

    await handler({} as APIGatewayEvent, {} as Context);
  });

  it("should not add changelog if the package does not have them", async () => {
    const packageResult = items[EXISTING_ITEM_PENDING_ID] as main.ItemResult;

    const handler = setupHandler({ packageResult, expectedPackage: packageResult });

    await handler({} as APIGatewayEvent, {} as Context);
  });
});
