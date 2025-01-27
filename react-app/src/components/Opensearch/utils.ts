import { opensearch } from "shared-types";

const filterMapQueryReducer = (
  state: Record<opensearch.Filterable<any>["prefix"], any[]>,
  filter: opensearch.Filterable<any>,
) => {
  if (filter.type === "exists") {
    state[filter.prefix].push({
      exists: { field: filter.field },
    });
  }

  if (filter.value === undefined || filter.value == null) return state;

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

  if (filter.type === "range") {
    state[filter.prefix].push({
      range: { [filter.field]: filter.value },
    });
  }

  if (filter.type === "global_search") {
    state[filter.prefix].push({
      dis_max: {
        tie_breaker: 0.7,
        boost: 1.2,
        queries: ["id", "submitterName", "leadAnalystName"].map((FIELD) => ({
          wildcard: {
            [`${FIELD}.keyword`]: {
              value: `*${(filter.value as string).trim()}*`,
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

export const paginationQueryBuilder = (pagination: opensearch.QueryState<any>["pagination"]) => {
  if (!pagination) return {};

  const from = (() => {
    if (
      !pagination?.number ||
      !pagination?.size ||
      pagination?.number < 1 ||
      pagination?.size < 1
    ) {
      return 0;
    }
    return pagination.number * pagination.size;
  })();

  return {
    size: pagination?.size && pagination?.size > 0 ? pagination?.size : 25,
    from,
  };
};

export const sortQueryBuilder = (sort: opensearch.QueryState<any>["sort"]) => {
  if (!sort?.field) return {};
  return { sort: [{ [sort.field]: sort.order || "asc" }] };
};

export const aggQueryBuilder = (aggs: opensearch.AggQuery<any>[]) => {
  if (!aggs?.length) return {};

  return {
    aggs: aggs.reduce((STATE, AGG) => {
      if (AGG?.name && AGG?.type && AGG?.field) {
        STATE[AGG.name] = {
          [AGG.type]: {
            field: AGG.field,
            order: { _term: "asc" },
            ...(AGG.size && { size: AGG.size }),
          },
        };
      }
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

export const checkMultiFilter = (filters: opensearch.Filterable<any>[] = [], val: number = 0) => {
  return (
    filters.length >= val ||
    filters.some((filter) => Array.isArray(filter.value) && filter.value.length >= val)
  );
};
