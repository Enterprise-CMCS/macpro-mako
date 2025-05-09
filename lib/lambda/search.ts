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
    query.query = query?.query || {};
    query.query.bool = query.query?.bool || {};
    query.query.bool.must = query.query.bool?.must || [];
    query.query.bool.must_not = query.query.bool?.must_not || [];
    query.query.bool.must_not.push({ term: { deleted: true } });

    const stateFilter = await getStateFilter(event);
    if (stateFilter) {
      query.query.bool.must.push(stateFilter);
    }
    // Return OneMAC records and NOSOs (denoted with SEATool origin and only NOSO)
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
    const results = await search(domain, index, query);
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
