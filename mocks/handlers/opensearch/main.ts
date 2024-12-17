import { http, HttpResponse, PathParams } from "msw";
import { GET_ERROR_ITEM_ID } from "../../data";
import items from "../../data/items";
import {
  SearchQueryBody,
  TestAppkDocument,
  TestAppkItemResult,
  TestItemResult,
  TestMainDocument,
} from "../../index.d";
import { getFilterKeys, getFilterValue, filterItemsByTerm } from "./util";

const defaultMainDocumentHandler = http.get(
  `https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-main/_doc/:id`,
  async ({ params }) => {
    const { id } = params;
    if (id == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }
    const itemId = id && Array.isArray(id) ? id[0] : id;
    const item = items[itemId] || null;

    return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 });
  },
);

const defaultMainSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-main/_search",
  async ({ request }) => {
    const { query } = await request.json();

    if (query?.match_all == "throw-error") {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    const must = query?.bool?.must;
    const mustTerms = must ? getFilterKeys(must) : [];

    // check if searching for appkChildren
    if (mustTerms.includes("appkParentId.keyword") || mustTerms.includes("appkParentId")) {
      const appkParentIdValue =
        getFilterValue(must, "appkParentId.keyword") || getFilterValue(must, "appkParentId");

      const appkParentId =
        Array.isArray(appkParentIdValue) && appkParentIdValue.length > 0
          ? appkParentIdValue[0]?.toString()
          : appkParentIdValue?.toString();

      if (appkParentId == GET_ERROR_ITEM_ID) {
        return new HttpResponse("Internal server error", { status: 500 });
      }

      const item = items[appkParentId || ""] || null;

      if (item?._source) {
        let appkChildren: TestAppkItemResult[] =
          (item._source?.appkChildren as TestAppkItemResult[]) || [];
        if (appkChildren.length > 0) {
          mustTerms.forEach((term) => {
            const filterValue = getFilterValue(must, term);
            const filterTerm: keyof TestAppkDocument = term.replace(
              ".keyword",
              "",
            ) as keyof TestAppkDocument;
            if (filterValue) {
              appkChildren = filterItemsByTerm<TestAppkDocument>(appkChildren, filterTerm, filterValue);
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
              value: appkChildren.length,
              relation: "eq",
            },
            max_score: null,
            hits: appkChildren,
          },
        });
      }
    }

    let itemHits: TestItemResult[] = Object.values(items) || [];

    if (itemHits.length > 0) {
      mustTerms.forEach((term) => {
        const filterValue = getFilterValue(must, term);
        const filterTerm: keyof TestMainDocument = term.replace(
          ".keyword",
          "",
        ) as keyof TestMainDocument;
        if (filterValue) {
          itemHits = filterItemsByTerm<TestMainDocument>(itemHits, filterTerm, filterValue);
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
          value: itemHits.length,
          relation: "eq",
        },
        max_score: null,
        hits: itemHits,
      },
    });
  },
);

export const mainSearchHandlers = [defaultMainDocumentHandler, defaultMainSearchHandler];
