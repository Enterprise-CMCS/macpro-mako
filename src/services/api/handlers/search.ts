import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { getStateFilter } from "../libs/auth/user";
import * as os from "./../../../libs/opensearch-lib";
import { onemacOriginFilter } from "shared-types/opensearch/main";
if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

// Handler function to search index
export const getSearchData = async (event: APIGatewayEvent) => {
  if (!event.pathParameters || !event.pathParameters.index) {
    return response({
      statusCode: 400,
      body: { message: "Index path parameter required" },
    });
  }
  try {
    let query: any = {};
    if (event.body) {
      query = JSON.parse(event.body);
    }
    query.query = query?.query || {};
    query.query.bool = query.query?.bool || {};
    query.query.bool.must = query.query.bool?.must || [];

    const stateFilter = await getStateFilter(event);
    if (stateFilter) {
      query.query.bool.must.push(stateFilter);
    }
    query.query.bool.must.push(onemacOriginFilter);

    query.from = query.from || 0;
    query.size = query.size || 100;

    console.log("Sending query, built as follow:");
    console.log(JSON.stringify(query, null, 2));

    if (!process.env.osDomain) {
      return response({
        statusCode: 500,
        body: { message: "Handler is missing process.env.osDomain env var" },
      });
    }

    const results = await os.search(
      process.env.osDomain,
      event.pathParameters.index as any,
      query
    );
    return response<unknown>({
      statusCode: 200,
      body: results,
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getSearchData;
