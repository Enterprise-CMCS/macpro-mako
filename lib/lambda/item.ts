import { errors as OpensearchErrors } from "@opensearch-project/opensearch";
import { APIGatewayEvent } from "aws-lambda";
import { validateEnvVariable } from "shared-utils";
import { getStateFilter } from "../libs/api/auth/user";
import { getAppkChildren, getPackage, getPackageChangelog } from "../libs/api/package";
import { response } from "../libs/handler-lib";

export const getItemData = async (event: APIGatewayEvent) => {
  validateEnvVariable("osDomain");
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const body = JSON.parse(event.body);

    const packageResult = await getPackage(body.id);
    if (!packageResult?.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const stateFilter = await getStateFilter(event);
    if (
      stateFilter &&
      (!packageResult?._source.state ||
        !stateFilter.terms.state.includes(packageResult._source.state.toLocaleLowerCase()))
    ) {
      return response({
        statusCode: 401,
        body: { message: "Not authorized to view this resource" },
      });
    }

    let appkChildren: any[] = [];
    if (packageResult?._source?.appkParent) {
      const children = await getAppkChildren(body.id);
      appkChildren = children.hits.hits;
    }
    const filter = [];
    // This is to handle hard deletes in legacy
    if (
      packageResult?._source?.legacySubmissionTimestamp !== null &&
      packageResult?._source?.legacySubmissionTimestamp !== undefined
    ) {
      filter.push({
        range: {
          timestamp: {
            gte: new Date(packageResult._source.legacySubmissionTimestamp).getTime(),
          },
        },
      });
    }

    const changelog = await getPackageChangelog(body.id, filter);

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
    if (error instanceof OpensearchErrors.ResponseError) {
      return response({
        statusCode: error?.statusCode || error?.meta?.statusCode || 500,
        body: {
          error: error?.body || error?.meta?.body || error,
          message: error.message,
        },
      });
    }

    return response({
      statusCode: 500,
      body: { error, message: error.message },
    });
  }
};

export const handler = getItemData;
