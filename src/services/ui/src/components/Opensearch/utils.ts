/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { OsFilterable, OsQueryState } from "shared-types";

const filterMapQueryReducer = (
  state: Record<OsFilterable["prefix"], any[]>,
  filter: OsFilterable
) => {
  if (filter.type === "match") {
    state[filter.prefix].push({
      match: { [filter.field]: filter.value },
    });
  }

  if (filter.type === "terms") {
    state[filter.prefix].push({
      terms: { [filter.field]: filter.value },
    });
  }

  if (filter.type === "range") {
    state[filter.prefix].push({
      range: { [filter.field]: filter.value },
    });
  }

  if (filter.type === "global_search") {
    if (filter.value) {
      state[filter.prefix].push({
        query_string: {
          fields: [
            "id.keyword",
            "submitterName.keyword",
            "leadAnalyst.keyword",
          ],
          query: `(${filter.value}) OR (*${filter.value}*)`,
        },
      });
    }
  }

  return state;
};

export const filterQueryBuilder = (filters: OsFilterable[]) => {
  if (!filters?.length) return {};

  return {
    query: {
      bool: filters.reduce(filterMapQueryReducer, {
        must: [],
        must_not: [],
        should: [],
        filter: [],
      }),
    },
  };
};

export const paginationQueryBuilder = (
  pagination: OsQueryState["pagination"]
) => {
  const from = (() => {
    if (!pagination.number) return 0;
    return pagination.number * pagination.size - 1;
  })();

  return {
    size: pagination.size,
    from,
  };
};

export const sortQueryBuilder = (sort: OsQueryState["sort"]) => {
  return { sort: [{ [sort.field]: sort.order }] };
};

// export const createBucketOptions = (aggregations: OsAggregations) => {
//   return Object.entries(aggregations).reduce((ACC, [key, value]) => {
//     if (!Array.isArray(value?.buckets)) return ACC;

//     ACC[key] = value.buckets.map((BUCK) => ({
//       label: `${BUCK.key} (${BUCK.doc_count})`,
//       value: BUCK.key,
//     }));

//     return ACC;
//   }, {} as OsQueryState["buckets"]);
// };

export const createSearchFilterable = (value: string) => {
  if (!value) return [];
  return [
    {
      type: "global_search",
      field: "",
      value,
      prefix: "must",
    } as const,
  ];
};
