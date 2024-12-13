import { http, HttpResponse, PathParams } from "msw";
import { GET_ERROR_ITEM_ID } from "../data";
import items from "../data/items";
import {
  SearchQueryBody,
  SearchTerm,
  TestAppkDocument,
  TestAppkItemResult,
  TestChangelogDocument,
  TestChangelogItemResult,
  TestItemResult,
  TestMainDocument,
} from "../index.d";

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

const getFilterValue = (
  query: SearchTerm | SearchTerm[],
  filterName: string,
): string | string[] | undefined => {
  if (query) {
    const rule: SearchTerm | undefined = Array.isArray(query)
      ? (query as SearchTerm[]).find(
          (rule) =>
            rule?.term?.[filterName] !== undefined || rule?.terms?.[filterName] !== undefined,
        )
      : (query as SearchTerm);

    if (rule?.term?.[filterName]) {
      return rule.term[filterName].toString();
    }

    if (rule?.terms?.[filterName]) {
      return rule.terms[filterName].map((value: string) => value?.toString());
    }
  }
  return;
};

const getFilterKeys = (query: SearchTerm[] | SearchTerm): string[] => {
  const filterKeys: string[] = [];
  if (query) {
    if (Array.isArray(query)) {
      (query as SearchTerm[]).forEach((rule) => {
        if (rule?.term !== undefined) {
          filterKeys.push(...Object.keys(rule.term));
        }
        if (rule?.terms !== undefined) {
          filterKeys.push(...Object.keys(rule.terms));
        }
      });
    } else {
      if ((query as SearchTerm)?.term !== undefined) {
        filterKeys.push(...Object.keys((query as SearchTerm).term));
      }
      if ((query as SearchTerm)?.terms !== undefined) {
        filterKeys.push(...Object.keys((query as SearchTerm).terms));
      }
    }
  }
  return filterKeys;
};

function matchFilter<T>(
  item: T | null | undefined,
  filterTerm: keyof T | null | undefined,
  filterValue: string | string[] | null | undefined,
): boolean {
  if (!item || !filterTerm || !filterValue) {
    return false;
  }

  const itemValue = item?.[filterTerm]?.toString()?.toLocaleLowerCase() || "";

  if (Array.isArray(filterValue)) {
    return filterValue.map((value) => value?.toString().toLocaleLowerCase()).includes(itemValue);
  }

  return filterValue?.toString()?.toLocaleLowerCase() == itemValue;
}

const filterItemResultByTerm = (
  hits: TestItemResult[],
  filterTerm: keyof TestMainDocument,
  filterValue: string | string[],
): TestItemResult[] => {
  return hits.filter(
    (hit) => hit?._source && matchFilter<TestMainDocument>(hit._source, filterTerm, filterValue),
  );
};

const filterAppkChildrenByTerm = (
  hits: TestAppkItemResult[],
  filterTerm: keyof TestAppkDocument,
  filterValue: string | string[],
): TestAppkItemResult[] => {
  return hits.filter(
    (hit) =>
      hit?._source &&
      matchFilter<TestAppkDocument>(hit._source as TestAppkDocument, filterTerm, filterValue),
  );
};

const filterChangelogByTerm = (
  hits: TestChangelogItemResult[],
  filterTerm: keyof TestChangelogDocument,
  filterValue: string | string[],
): TestChangelogItemResult[] => {
  return hits.filter(
    (hit) =>
      hit?._source &&
      matchFilter<TestChangelogDocument>(
        hit._source as TestChangelogDocument,
        filterTerm,
        filterValue,
      ),
  );
};

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
              appkChildren = filterAppkChildrenByTerm(appkChildren, filterTerm, filterValue);
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
          itemHits = filterItemResultByTerm(itemHits, filterTerm, filterValue);
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

const defaultChangelogSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-changelog/_search",
  async ({ request }) => {
    const { query } = await request.json();
    const must = query?.bool?.must;
    const mustTerms = must ? getFilterKeys(must) : [];

    const packageIdValue = getFilterValue(must, "packageId.keyword");

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
          const filterValue = getFilterValue(must, term);
          const filterTerm: keyof TestChangelogDocument = term.replace(
            ".keyword",
            "",
          ) as keyof TestChangelogDocument;
          if (filterValue) {
            changelog = filterChangelogByTerm(changelog, filterTerm, filterValue);
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

export const defaultHandlers = [
  defaultMainDocumentHandler,
  defaultMainSearchHandler,
  defaultChangelogSearchHandler,
];
