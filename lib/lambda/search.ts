import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getDomainAndNamespace } from "libs/utils";
import { BaseIndex } from "shared-types/opensearch";
import { ONEMAC_LEGACY_ORIGIN } from "shared-types/opensearch/main/transforms/legacy-transforms";
import { validateEnvVariable } from "shared-utils";

import { getStateFilter } from "../libs/api/auth/user";
import { getAppkChildren } from "../libs/api/package";
import { search } from "../libs/opensearch-lib";
import { handleOpensearchError } from "./utils";

// Handler function to search index
export const getSearchData = async (event: APIGatewayEvent) => {
  validateEnvVariable("osDomain");
  console.log("here");
  if (!event.pathParameters || !event.pathParameters.index) {
    console.log("kjd;flkdj;lkfjdk");
    console.error(
      "event.pathParameters.index path parameter required, Event: ",
      JSON.stringify(event, null, 2),
    );
    return response({
      statusCode: 400,
      body: { message: "Index path parameter required" },
    });
  }
  console.log("there");
  const { domain, index } = getDomainAndNamespace(event.pathParameters.index as BaseIndex);

  try {
    let query: any = {};
    if (event.body) {
      query = JSON.parse(event.body);
    }
    console.log("build query");
    query.query = query?.query || {};
    query.query.bool = query.query?.bool || {};
    query.query.bool.must = query.query.bool?.must || [];
    query.query.bool.must_not = query.query.bool?.must_not || [];
    query.query.bool.must_not.push({ term: { deleted: true } });

    const stateFilter = await getStateFilter(event);
    if (stateFilter) {
      query.query.bool.must.push(stateFilter);
    }
    console.log("query built");
    // Return OneMAC records and NOSOs (denoted with SEATool origin)
    query.query.bool.must.push({
      bool: {
        should: [
          { terms: { "origin.keyword": ["OneMAC", ONEMAC_LEGACY_ORIGIN] } },
          {
            bool: {
              must: [
                { term: { "origin.keyword": "SEATool" } },
                { term: { "event.keyword": "NOSO" } },
              ],
            },
          },
        ],
      },
    });

    query.from = query.from || 0;
    query.size = query.size || 100;
    console.log("results");
    const results = await search(domain, index, query);
    console.log("reults");
    console.log(results);
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
