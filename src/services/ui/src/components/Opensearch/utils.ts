import { opensearch } from "shared-types";

const filterMapQueryReducer = (
  state: Record<opensearch.Filterable<any>["prefix"], any[]>,
  filter: opensearch.Filterable<any>
) => {
  // this was hoisted up since false is a valid "match" value
  if (filter.type === "match") {
    state[filter.prefix].push({
      match: { [filter.field]: filter.value },
    });
  }

  if (!filter.value) return state;

  if (filter.type === "terms") {
    state[filter.prefix].push({
      terms: { [filter.field]: filter.value },
    });
  }

  if (filter.type === "term") {
    state[filter.prefix].push({
      term: { [filter.field]: filter.value },
    });
  }

  if (filter.type === "exists") {
    state[filter.prefix].push({
      exists: { field: filter.field },
    });
  }

  if (filter.type === "range") {
    state[filter.prefix].push({
      range: { [filter.field]: filter.value },
    });
  }

  if (filter.type === "global_search") {
    if (!filter.value) return state;
    state[filter.prefix].push({
      dis_max: {
        tie_breaker: 0.7,
        boost: 1.2,
        queries: ["id", "submitterName", "leadAnalystName"].map((FIELD) => ({
          wildcard: {
            [`${FIELD}.keyword`]: {
              value: `*${filter.value}*`,
              case_insensitive: true,
            },
          },
        })),
      },
    });
  }

  return state;
};

export const filterQueryBuilder = (filters: opensearch.Filterable<any>[]) => {
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
  pagination: opensearch.QueryState<any>["pagination"]
) => {
  const from = (() => {
    if (!pagination.number) return 0;
    return pagination.number * pagination.size;
  })();

  return {
    size: pagination.size,
    from,
  };
};

export const sortQueryBuilder = (sort: opensearch.QueryState<any>["sort"]) => {
  return { sort: [{ [sort.field]: sort.order }] };
};

export const aggQueryBuilder = (aggs: opensearch.AggQuery<any>[]) => {
  return {
    aggs: aggs.reduce((STATE, AGG) => {
      STATE[AGG.name] = {
        [AGG.type]: {
          field: AGG.field,
          order: { _term: "asc" },
          ...(AGG.size && { size: AGG.size }),
        },
      };
      return STATE;
    }, {} as any),
  };
};

export const createSearchFilterable = (value?: string) => {
  if (!value) return [];
  return [
    {
      type: "global_search",
      field: "",
      value,
      prefix: "must",
    } as unknown as opensearch.Filterable<any>,
  ];
};

export const checkMultiFilter = (
  filters: opensearch.Filterable<any>[],
  val: number
) => {
  return (
    filters.length >= val ||
    filters.some(
      (filter) => Array.isArray(filter.value) && filter.value.length >= val
    )
  );
};
