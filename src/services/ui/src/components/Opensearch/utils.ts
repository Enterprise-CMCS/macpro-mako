import { OsAggQuery, OsFilterable, OsQueryState } from "shared-types";

const filterMapQueryReducer = (
  state: Record<OsFilterable<any>["prefix"], any[]>,
  filter: OsFilterable<any>
) => {
  if (!filter.value) return state;

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
        multi_match: {
          type: "best_fields",
          query: filter.value,
          fields: ["id", "submitterName", "leadAnalystName"],
        },
      });
    }
  }

  return state;
};

export const filterQueryBuilder = (filters: OsFilterable<any>[]) => {
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
  pagination: OsQueryState<any>["pagination"]
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

export const sortQueryBuilder = (sort: OsQueryState<any>["sort"]) => {
  return { sort: [{ [sort.field]: sort.order }] };
};

export const aggQueryBuilder = (aggs: OsAggQuery<any>[]) => {
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
    } as unknown as OsFilterable<any>,
  ];
};

export const checkMultiFilter = (filters: OsFilterable<any>[], val: number) => {
  return (
    filters.length >= val ||
    filters.some(
      (filter) => Array.isArray(filter.value) && filter.value.length >= val
    )
  );
};
