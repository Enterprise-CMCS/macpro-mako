import { http, HttpResponse, PathParams } from "msw";
import { GET_ERROR_ITEM_ID } from "../../data";
import items from "../../data/items";
import {
  SearchQueryBody,
  TestAppkDocument,
  TestAppkItemResult,
  TestItemResult,
  TestMainDocument,
  GetMultiItemBody,
} from "../../index.d";
import { getTermKeys, filterItemsByTerm, getTermValues } from "../search.utils";

const defaultOSMainDocumentHandler = http.get(
  `https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-main/_doc/:id`,
  async ({ params }) => {
    const { id } = params;

    if (id == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }
    const itemId = id && Array.isArray(id) ? id[0] : id;
    const item = items[itemId] || null;
    return item
      ? HttpResponse.json(item)
      : HttpResponse.json({
          found: false,
        });
  },
);
const defaultUpdateHandler = http.post(
  `https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-main/_update/:id`,
  async ({ params }) => {
    const { id } = params;
    if (id == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }
    const itemId = id && Array.isArray(id) ? id[0] : id;
    const item = items[itemId] || null;
    return item
      ? HttpResponse.json(item)
      : HttpResponse.json({
          found: false,
        });
  },
);
const defaultOSMainMultiDocumentHandler = http.post<PathParams, GetMultiItemBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-main/_mget",
  async ({ request }) => {
    const { ids } = await request.json();

    const mItems = Object.values(items).filter((item) => ids.includes(item?._id || "")) || [];

    return HttpResponse.json({
      docs: mItems,
    });
  },
);

export const errorOSMainMultiDocumentHandler = http.post<PathParams, GetMultiItemBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-main/_mget",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

const defaultOSMainSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-main/_search",
  async ({ request }) => {
    const { query } = await request.json();

    if (query?.match_all?.id == "throw-error") {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    const must = query?.bool?.must;
    const mustTerms = getTermKeys(must);
    const regexpQueries = query?.regexp;

    let itemHits: TestItemResult[] = Object.values(items) || [];

    if (regexpQueries) {
      for (const fieldName in regexpQueries) {
        const filteredFieldName = fieldName.replace(".keyword", "") as keyof TestItemResult;
        const regexPattern = String(regexpQueries[fieldName]);
        const regex = new RegExp(regexPattern);

        itemHits = itemHits.filter((item) => {
          const fieldValue =
            item[filteredFieldName] ??
            item._source?.[filteredFieldName as keyof typeof item._source];
          return fieldValue && regex.test(String(fieldValue));
        });
      }
    }

    const appkParentIdValue =
      getTermValues(must, "appkParentId.keyword") || getTermValues(must, "appkParentId");

    if (appkParentIdValue) {
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
          // TODO We don't have this field in the TypeScript, not sure what the parent field actually is
          const filteredTerms = mustTerms.filter(
            (term) => term !== "appkParentId.keyword" && term !== "appkParentId",
          );
          filteredTerms.forEach((term) => {
            const filterValue = getTermValues(must, term);
            const filterTerm: keyof TestAppkDocument = term.replace(
              ".keyword",
              "",
            ) as keyof TestAppkDocument;
            if (filterValue) {
              appkChildren = filterItemsByTerm<TestAppkDocument>(
                appkChildren,
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
              value: appkChildren.length,
              relation: "eq",
            },
            max_score: null,
            hits: appkChildren,
          },
        });
      }
    }

    if (itemHits.length > 0) {
      mustTerms.forEach((term) => {
        const filterValue = getTermValues(must, term);
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

export const mainSearchHandlers = [
  defaultOSMainDocumentHandler,
  defaultOSMainMultiDocumentHandler,
  defaultOSMainSearchHandler,
  defaultUpdateHandler,
];
