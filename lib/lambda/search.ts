import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getDomainAndNamespace, getOsNamespace } from "libs/utils";
import { SEATOOL_STATUS } from "shared-types";
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
  const requestedIndex = event.pathParameters.index as BaseIndex;
  const { domain, index } = getDomainAndNamespace(requestedIndex);

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
      if (requestedIndex === "main") {
        const draftIndex = getOsNamespace("draftmain");
        query.query.bool.must.push({
          bool: {
            should: [
              {
                bool: {
                  must_not: [{ term: { "seatoolStatus.keyword": SEATOOL_STATUS.DRAFT } }],
                },
              },
              {
                bool: {
                  must: [
                    { term: { "seatoolStatus.keyword": SEATOOL_STATUS.DRAFT } },
                    { term: { _index: draftIndex } },
                  ],
                },
              },
            ],
            minimum_should_match: 1,
          },
        });
      }
    } else if (stateFilter === null) {
      // Drafts are state-only and should not appear in CMS search results.
      query.query.bool.must_not.push({ term: { "seatoolStatus.keyword": SEATOOL_STATUS.DRAFT } });
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
    const searchIndex: Parameters<typeof search>[1] =
      requestedIndex === "main" && stateFilter
        ? (`${index},${getOsNamespace("draftmain")}` as Parameters<typeof search>[1])
        : index;
    const results = await search(domain, searchIndex, query);
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
