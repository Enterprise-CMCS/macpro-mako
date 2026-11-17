import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getDomainAndNamespace, getOsNamespace } from "libs/utils";
import { SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { ONEMAC_LEGACY_ORIGIN } from "shared-types/opensearch/main/transforms/legacy-transforms";
import { validateEnvVariable } from "shared-utils";

import { getSearchUserScope } from "../libs/api/auth/user";
import { getAppkChildren } from "../libs/api/package";
import { search } from "../libs/opensearch-lib";
import { searchIndexSchema, searchRequestSchema } from "./search.schema";
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
  const parsedIndex = searchIndexSchema.safeParse(event.pathParameters.index);
  if (!parsedIndex.success) {
    return response({ statusCode: 400, body: { message: "Unsupported search index" } });
  }
  const requestedIndex = parsedIndex.data;
  const { domain, index } = getDomainAndNamespace(requestedIndex);

  let body: unknown;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return response({ statusCode: 400, body: { message: "Invalid search request" } });
  }
  const parsedRequest = searchRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return response({ statusCode: 400, body: { message: "Invalid search request" } });
  }

  try {
    const query: any = parsedRequest.data;
    const clientQuery = query.query;
    query.query = clientQuery?.bool
      ? clientQuery
      : { bool: { must: clientQuery ? [clientQuery] : [] } };
    query.query.bool.must = query.query.bool?.must || [];
    query.query.bool.must_not = query.query.bool?.must_not || [];
    const accessQuery = {
      bool: { must: [] as unknown[], must_not: [{ term: { deleted: true } }] as unknown[] },
    };
    const includeDrafts = query.includeDrafts !== false;
    delete query.includeDrafts;

    const { stateFilter, canViewDrafts } = await getSearchUserScope(event);
    if (stateFilter === false) {
      return response({ statusCode: 403, body: { message: "Not authorized to search packages" } });
    }
    const shouldIncludeDrafts =
      includeDrafts && requestedIndex === "main" && (Boolean(stateFilter) || canViewDrafts);
    if (stateFilter) {
      accessQuery.bool.must.push(stateFilter);
      if (shouldIncludeDrafts) {
        const draftIndex = getOsNamespace("draftmain");
        accessQuery.bool.must.push({
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
    } else if (stateFilter === null && !canViewDrafts) {
      // Drafts are state-only and should not appear in CMS search results.
      accessQuery.bool.must_not.push({ term: { "seatoolStatus.keyword": SEATOOL_STATUS.DRAFT } });
    } else if (shouldIncludeDrafts) {
      const draftIndex = getOsNamespace("draftmain");
      accessQuery.bool.must.push({
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
    const completedSmartPackage = {
      bool: {
        should: [
          { term: { smartRecordType: SMART_RECORD_TYPE.PACKAGE } },
          { term: { "smartRecordType.keyword": SMART_RECORD_TYPE.PACKAGE } },
        ],
        minimum_should_match: 1,
      },
    };
    // Children may originate in SEATool without being NOSOs. Preserve that behavior
    // while enforcing the user's state/draft scope and hiding SMART reservations.
    const childAccessQuery = {
      bool: {
        must: [...accessQuery.bool.must],
        must_not: [
          ...accessQuery.bool.must_not,
          {
            bool: {
              must: [{ term: { "origin.keyword": "SMART" } }],
              must_not: [completedSmartPackage],
            },
          },
        ],
      },
    };
    // Return OneMAC records and NOSOs (denoted with SEATool origin and only NOSO)
    accessQuery.bool.must.push({
      bool: {
        should: [
          { terms: { "origin.keyword": ["OneMAC", ONEMAC_LEGACY_ORIGIN] } },
          {
            bool: {
              must: [{ term: { "origin.keyword": "SMART" } }, completedSmartPackage],
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

    query.query.bool.must.push(...accessQuery.bool.must);
    query.query.bool.must_not.push(...accessQuery.bool.must_not);
    query.from = query.from ?? 0;
    query.size = query.size ?? 100;
    const searchIndex: Parameters<typeof search>[1] = shouldIncludeDrafts
      ? (`${index},${getOsNamespace("draftmain")}` as Parameters<typeof search>[1])
      : index;
    const results = await search(domain, searchIndex, query);
    for (let i = 0; i < results?.hits?.hits?.length; i++) {
      if (results.hits.hits[i]._source?.appkParent) {
        const children = await getAppkChildren(results.hits.hits[i]._id, [childAccessQuery]);
        results.hits.hits[i]._source.appkChildren = children?.hits?.hits ?? [];
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
