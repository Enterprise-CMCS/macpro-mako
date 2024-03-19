import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { getStateFilter } from "../libs/auth/user";
import {
  getAppkChildren,
  getPackage,
  getPackageChangelog,
} from "../libs/package";
import { Authority } from "shared-types";
if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

export const getItemData = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const body = JSON.parse(event.body);
    const stateFilter = await getStateFilter(event);
    const packageResult = await getPackage(body.id);

    let appkChildren: any[] = [];
    if (packageResult._source.authority === Authority["1915c"]) {
      const children = await getAppkChildren(body.id);
      appkChildren = children.hits.hits;
    }
    const filter = [];
    // This is to handle hard deletes in legacy
    if (packageResult._source.legacySubmissionTimestamp !== null) {
      filter.push({
        range: {
          timestamp: {
            gte: new Date(
              packageResult._source.legacySubmissionTimestamp,
            ).getTime(),
          },
        },
      });
    }

    const changelog = await getPackageChangelog(
      body.id,
      legacySubmissionTimestampFitler,
    );
    if (
      stateFilter &&
      (!packageResult._source.state ||
        !stateFilter.terms.state.includes(
          packageResult._source.state.toLocaleLowerCase(),
        ))
    ) {
      return response({
        statusCode: 401,
        body: { message: "Not authorized to view this resource" },
      });
    }

    if (!packageResult.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    return response<unknown>({
      statusCode: 200,
      body: {
        ...packageResult,
        _source: {
          ...packageResult._source,
          ...(!!appkChildren.length && { appkChildren }),
          changelog: changelog.hits.hits,
        },
      },
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getItemData;
