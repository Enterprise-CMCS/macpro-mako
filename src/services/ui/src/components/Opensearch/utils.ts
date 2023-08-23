/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import type {
  AggregateQuery,
  Aggregations,
  Filterable,
  QueryState,
} from "./types";

const filterMapQueryReducer = (
  state: Record<Filterable["prefix"], any[]>,
  filter: Filterable
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
          query: `(${filter.value}) OR (*${filter.value}*)`,
        },
      });
    }
  }

  return state;
};

export const filterQueryBuilder = (filters: Filterable[]) => {
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
  pagination: QueryState["pagination"]
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

export const sortQueryBuilder = (sort: QueryState["sort"]) => {
  return { sort: [{ [sort.field]: sort.order }] };
};

export const createBucketOptions = (aggregations: Aggregations) => {
  return Object.entries(aggregations).reduce((ACC, [key, value]) => {
    if (!Array.isArray(value?.buckets)) return ACC;

    ACC[key] = value.buckets.map((BUCK) => ({
      label: `${BUCK.key} (${BUCK.doc_count})`,
      value: BUCK.key,
    }));

    return ACC;
  }, {} as QueryState["buckets"]);
};

export const elasticSearchRequest = async (params: {
  aggs?: AggregateQuery;
  filters: Filterable[];
  queryString?: string;
  sort?: QueryState["sort"];
  pagination: QueryState["pagination"];
  onSuccess?: (res: any) => void;
  onError?: (err: Error) => void;
}) => {
  const filterQuery = (() => {
    if (!params.filters?.length && !params.queryString) return {};

    return {
      query: {
        ...(params.filters?.length && {
          bool: filtersQueryBuilder(params.filters),
        }),
        ...(params.queryString && {
          query_string: { query: params.queryString },
        }),
      },
    };
  })();

  const response = await fetch("/api/elasticsearch", {
    method: "POST",
    body: JSON.stringify({
      ...paginationQuery(params.pagination),
      ...filterQuery,
      ...(params.sort && {
        sort: [{ [params.sort.field]: params.sort.order }],
      }),
      ...(params.aggs && {
        aggs: {
          all: {
            global: {},
            aggs: params.aggs,
          },
        },
      }),
    }),
  });

  if (!response.ok) {
    return params.onError?.(new Error(response.statusText));
  }

  const result = await response.json();

  if ("err" in result) {
    return params?.onError?.(new Error(result.err));
  }

  if ("error" in result) {
    const [error] = result.error?.root_cause;
    return params?.onError?.(new Error(`${error.type}: ${error.reason}`));
  }

  params.onSuccess?.(result);
};
