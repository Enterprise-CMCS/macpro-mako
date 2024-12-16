import { handleOpensearchError } from "./utils";
import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { Index } from "shared-types/opensearch";
import { validateEnvVariable } from "shared-utils";
import { getStateFilter } from "../libs/api/auth/user";
import { getAppkChildren } from "../libs/api/package";
import * as os from "../libs/opensearch-lib";

// Handler function to search index
export const getSearchData = async (event: APIGatewayEvent) => {
  validateEnvVariable("osDomain");
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

    const results = await os.search(
      process.env.osDomain as string,
      `${process.env.indexNamespace}${event.pathParameters.index}` as Index,
      query,
    );

    for (let i = 0; i < results?.hits?.hits?.length; i++) {
      if (results.hits.hits[i]._source?.appkParent) {
        const children = await getAppkChildren(results.hits.hits[i]._id);
        if (children?.hits?.hits?.length > 0) {
          results.hits.hits[i]._source.appkChildren = children.hits.hits;
        }
      }
    }

    return response<unknown>({
      statusCode: 200,
      body: results,
    });
  } catch (error) {
    return response(handleOpensearchError(error));
  }
};

export const handler = getSearchData;
