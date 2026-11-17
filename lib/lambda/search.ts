import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getDomainAndNamespace, getOsNamespace } from "libs/utils";
import { SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { BaseIndex } from "shared-types/opensearch";
import { ONEMAC_LEGACY_ORIGIN } from "shared-types/opensearch/main/transforms/legacy-transforms";
import { validateEnvVariable } from "shared-utils";

import { getSearchUserScope } from "../libs/api/auth/user";
import { getAppkChildren } from "../libs/api/package";
import { search } from "../libs/opensearch-lib";
import { assertSafeSearchQuery, UnsupportedSearchQueryError } from "./searchQueryGuard";
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
  if (requestedIndex !== "main" && requestedIndex !== "changelog") {
    return response({
      statusCode: 400,
      body: { message: "Index is not searchable" },
    });
  }
  const { domain, index } = getDomainAndNamespace(requestedIndex);

  try {
    const requestBody: Record<string, any> = event.body ? JSON.parse(event.body) : {};
    const { stateFilter, canViewDrafts } = await getSearchUserScope(event);
    if (stateFilter === false) {
      return response({
        statusCode: 403,
        body: { message: "Not authorized to search" },
      });
    }

    assertSafeSearchQuery(requestBody);

    const includeDrafts = requestBody.includeDrafts !== false;
    const clientQuery = requestBody.query;
    const query: Record<string, any> = { ...requestBody };
    delete query.includeDrafts;
    delete query.query;

    const hasClientQuery =
      clientQuery &&
      typeof clientQuery === "object" &&
      !Array.isArray(clientQuery) &&
      Object.keys(clientQuery).length > 0;
    const must: unknown[] = [hasClientQuery ? clientQuery : { match_all: {} }];
    const mustNot: unknown[] = [{ term: { deleted: true } }];
    const shouldIncludeDrafts =
      includeDrafts && requestedIndex === "main" && (Boolean(stateFilter) || canViewDrafts);
    if (stateFilter) {
      must.push(stateFilter);
    } else if (!canViewDrafts) {
      // Drafts are state-only and should not appear in CMS search results.
      mustNot.push({ term: { "seatoolStatus.keyword": SEATOOL_STATUS.DRAFT } });
    }
    if (shouldIncludeDrafts) {
      const draftIndex = getOsNamespace("draftmain");
      must.push({
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
    // Return OneMAC records and NOSOs (denoted with SEATool origin and only NOSO)
    must.push({
      bool: {
        should: [
          { terms: { "origin.keyword": ["OneMAC", ONEMAC_LEGACY_ORIGIN] } },
          {
            bool: {
              must: [
                { term: { "origin.keyword": "SMART" } },
                {
                  bool: {
                    should: [
                      { term: { smartRecordType: SMART_RECORD_TYPE.PACKAGE } },
                      { term: { "smartRecordType.keyword": SMART_RECORD_TYPE.PACKAGE } },
                    ],
                    minimum_should_match: 1,
                  },
                },
              ],
            },
          },
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

    query.query = { bool: { must, must_not: mustNot } };
    query.from = query.from || 0;
    query.size = query.size || 100;
    const searchIndex: Parameters<typeof search>[1] = shouldIncludeDrafts
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
    if (error instanceof UnsupportedSearchQueryError) {
      return response({
        statusCode: 400,
        body: { message: error.message },
      });
    }
    return response(handleOpensearchError(error));
  }
};

export const handler = getSearchData;
