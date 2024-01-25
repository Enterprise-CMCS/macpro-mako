import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { getStateFilter } from "../libs/auth/user";
import { getPackage, getPackageChangelog } from "../libs/package";
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
    const changelog = await getPackageChangelog(body.id);
    if (
      stateFilter &&
      (!packageResult._source.state ||
        !stateFilter.terms.state.includes(
          packageResult._source.state.toLocaleLowerCase()
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
        _source: { ...packageResult._source, changelog: changelog.hits.hits },
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
