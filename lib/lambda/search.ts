import { handleOpensearchError } from "./utils";
import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { BaseIndex } from "shared-types/opensearch";
import { validateEnvVariable } from "shared-utils";
import { getStateFilter } from "../libs/api/auth/user";
import { getAppkChildren } from "../libs/api/package";
import * as os from "../libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

// Handler function to search index
export const getSearchData = async (event: APIGatewayEvent) => {
  validateEnvVariable("osDomain");

  if (!event.pathParameters || !event.pathParameters.index) {
    console.error(
      "event.pathParameters.index path parameter required, Event: ",
      JSON.stringify(event, null, 2),
    );
    return response({
      statusCode: 400,
      body: { message: "Index path parameter required" },
    });
  }

  const { domain, index } = getDomainAndNamespace(event.pathParameters.index as BaseIndex);

  try {
    let query: any = {};
    if (event.body) {
      query = JSON.parse(event.body);
    }

    // Initialize query structure with defaults
    query.query = query?.query || {};
    query.query.bool = query.query?.bool || {};
    query.query.bool.must = query.query.bool?.must || [];
    query.query.bool.must_not = query.query.bool?.must_not || [];
    query.query.bool.must_not.push({ term: { deleted: true } });

    // Add state filter if applicable
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

    // Pagination parameters with defaults
    query.from = query.from || 0;
    query.size = query.size || 100;

    const results = await os.search(domain, index, query);

    // Fetch children for appkParent documents
    const childrenPromises =
      results?.hits?.hits
        ?.filter(
          (hit: { _source?: { appkParent?: boolean }; _id: string }) => hit._source?.appkParent,
        )
        ?.map(async (hit: { _source?: { appkChildren?: any[] }; _id: string }) => {
          const children = await getAppkChildren(hit._id);
          if (children?.hits?.hits?.length > 0) {
            hit._source = hit._source || {};
            hit._source.appkChildren = children.hits.hits;
          }
          return hit;
        }) || [];

    await Promise.all(childrenPromises);

    return response<unknown>({
      statusCode: 200,
      body: results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return response(handleOpensearchError(error));
  }
};

export const handler = getSearchData;
