import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { getStateFilter } from "../libs/auth/user";
import * as os from "./../../../libs/opensearch-lib";
import { getAppkChildren } from "../libs/package";
import { Index } from "shared-types/opensearch";
import { ItemResult } from "shared-types/opensearch/main";
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

    // Return OneMAC records and NOSOs (denoted with SEATool origin)
    query.query.bool.must.push({
      terms: {
        "origin.keyword": ["OneMAC", "SEATool"],
      },
    });

    query.from = query.from || 0;
    query.size = query.size || 100;

    if (!process.env.osDomain) {
      return response({
        statusCode: 500,
        body: { message: "Handler is missing process.env.osDomain env var" },
      });
    }

    const results = await os.search(
      process.env.osDomain,
      event.pathParameters.index as Index,
      query,
    );

    for (let i = 0; i < results.hits.hits.length; i++) {
      if (results.hits.hits[i]._source.appkParent) {
        const children = await getAppkChildren(results.hits.hits[i]._id);
        if (children.hits?.hits.length > 0) {
          results.hits.hits[i]._source.appkChildren = children.hits.hits;
        }
      }
    }

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
