import { http, HttpResponse, PathParams } from "msw";
import { GET_ERROR_ITEM_ID } from "../../data";
import items from "../../data/items";
import { SearchQueryBody, TestChangelogDocument, TestChangelogItemResult } from "../../index.d";
import { getTermKeys, getTermValues, filterItemsByTerm } from "../search.utils";

const defaultOSChangelogSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-changelog/_search",
  async ({ request }) => {
    const { query } = await request.json();
    const must = query?.bool?.must;
    const mustTerms = must ? getTermKeys(must) : [];

    const packageIdValue =
      getTermValues(must, "packageId.keyword") || getTermValues(must, "packageId");

    if (!packageIdValue) {
      return new HttpResponse("No packageId provided", { status: 400 });
    }

    const packageId =
      Array.isArray(packageIdValue) && packageIdValue.length > 0
        ? packageIdValue[0]?.toString()
        : packageIdValue?.toString();

    if (packageId == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    const item = items[packageId] || null;

    if (item?._source) {
      let changelog: TestChangelogItemResult[] =
        (item._source?.changelog as TestChangelogItemResult[]) || [];
      if (changelog.length > 0) {
        mustTerms.forEach((term) => {
          const filterValue = getTermValues(must, term);
          const filterTerm: keyof TestChangelogDocument = term.replace(
            ".keyword",
            "",
          ) as keyof TestChangelogDocument;
          if (filterValue) {
            changelog = filterItemsByTerm<TestChangelogDocument>(
              changelog,
              filterTerm,
              filterValue,
            );
          }
        });
      }

      return HttpResponse.json({
        took: 5,
        timed_out: false,
        _shards: {
          total: 5,
          successful: 5,
          skipped: 0,
          failed: 0,
        },
        hits: {
          total: {
            value: changelog.length,
            relation: "eq",
          },
          max_score: null,
          hits: changelog,
        },
      });
    }

    return new HttpResponse(null, { status: 404 });
  },
);

export const changelogSearchHandlers = [defaultOSChangelogSearchHandler];
