import { QueryContainer, TermQuery, TermsQuery, TestHit, QueryAggs, TestAggResult } from "..";

export const getFilterValue = (
  query: QueryContainer | QueryContainer[] | undefined,
  queryKey: keyof QueryContainer,
  filterName: string,
): string | string[] | undefined => {
  if (query) {
    const rules: QueryContainer[] = Array.isArray(query) ? query : [query];
    const values: string[] = [];
    rules.forEach((rule) => {
      if (rule?.[queryKey]?.[filterName] !== undefined) {
        if (Array.isArray(rule[queryKey][filterName])) {
          rule[queryKey][filterName].forEach((value) => {
            if (value !== undefined) {
              values.push(value.toString());
            }
          });
        } else {
          values.push(rule[queryKey][filterName].toString());
        }
      }
    });

    if (values.length === 0) return undefined;
    if (values.length === 1) return values[0].toString();

    return values.map((value) => value.toString());
  }
  return undefined;
};

export const getFilterValueAsBoolean = (
  query: QueryContainer | QueryContainer[] | undefined,
  queryKey: keyof QueryContainer,
  filterName: string,
): boolean | undefined => {
  const value = getFilterValue(query, queryKey, filterName);

  if (value === undefined) {
    return undefined;
  }

  const parseSingleStringBoolean = (value: string | undefined): boolean | undefined => {
    if (typeof value === "string") {
      if (value.toLowerCase() === "true" || value.toLowerCase() === "yes") {
        return true;
      }
      if (value.toLowerCase() === "false" || value.toLowerCase() === "no") {
        return false;
      }
    }
    return undefined;
  };

  if (typeof value === "string") {
    return parseSingleStringBoolean(value);
  }

  if (Array.isArray(value) && value.length > 0) {
    const boolValues = value
      .map((val) => parseSingleStringBoolean(val))
      .filter((val) => val !== undefined);
    if (boolValues.length > 0) {
      return boolValues.every((val) => val === true);
    }
  }

  return undefined;
};

export const getFilterValueAsNumber = (
  query: QueryContainer | QueryContainer[] | undefined,
  queryKey: keyof QueryContainer,
  filterName: string,
): number | undefined => {
  const value = getFilterValue(query, queryKey, filterName);

  const intValues = parseValueAsNumberArray(value);

  if (intValues.length > 0) {
    return intValues[0];
  }

  return undefined;
};

export const getFilterValueAsNumberArray = (
  query: QueryContainer | QueryContainer[] | undefined,
  queryKey: keyof QueryContainer,
  filterName: string,
): number[] => {
  const value = getFilterValue(query, queryKey, filterName);

  return parseValueAsNumberArray(value);
};

const parseValueAsNumberArray = (value: string | string[] | undefined): number[] => {
  if (value == undefined) {
    return [];
  }

  if (typeof value === "string") {
    return [Number.parseInt(value)];
  }

  return (
    value.filter((val) => val && typeof val === "string").map((val) => Number.parseInt(val)) || []
  );
};

export const getFilterValueAsString = (
  query: QueryContainer | QueryContainer[] | undefined,
  queryKey: keyof QueryContainer,
  filterName: string,
): string | undefined => {
  const value = getFilterValue(query, queryKey, filterName);

  return parseValueAsStringArray(value).join(",");
};

export const getFilterValueAsStringArray = (
  query: QueryContainer | QueryContainer[] | undefined,
  queryKey: keyof QueryContainer,
  filterName: string,
): string[] => {
  const value = getFilterValue(query, queryKey, filterName);

  return parseValueAsStringArray(value);
};

const parseValueAsStringArray = (value: string | string[] | undefined): string[] => {
  if (value == undefined) {
    return [];
  }

  if (typeof value === "string") {
    return value.split(",").map((val) => val.trim());
  }

  return value.filter((val) => val && typeof val === "string").map((val) => val.trim()) || [];
};

export const getTermValues = (
  query: QueryContainer | QueryContainer[] | undefined,
  filterName: string,
): string | string[] | undefined => {
  const term = getFilterValue(query, "term", filterName);
  const terms = getFilterValue(query, "terms", filterName);

  if (term && terms) {
    const values: string[] = [];
    values.concat(Array.isArray(term) ? term : [term]);
    values.concat(Array.isArray(terms) ? terms : [terms]);
    return values;
  }

  return term || terms;
};

export const getTermKeys = (query: QueryContainer[] | QueryContainer | undefined): string[] => {
  const filterKeys: string[] = [];
  if (query) {
    if (Array.isArray(query)) {
      (query as QueryContainer[]).forEach((rule) => {
        if (rule?.term !== undefined) {
          filterKeys.push(...Object.keys(rule.term));
        }
        if (rule?.terms !== undefined) {
          filterKeys.push(...Object.keys(rule.terms));
        }
      });
    } else {
      if ((query as QueryContainer)?.term !== undefined) {
        filterKeys.push(...Object.keys(query.term as Record<string, TermQuery>));
      }
      if ((query as QueryContainer)?.terms !== undefined) {
        filterKeys.push(...Object.keys(query.terms as TermsQuery));
      }
    }
  }
  return filterKeys;
};

export const matchFilter = <T>(
  item: T | null | undefined,
  filterTerm: keyof T | null | undefined,
  filterValue: string | string[] | null | undefined,
): boolean => {
  if (!item || !filterTerm || !filterValue) {
    return false;
  }

  const itemValue = item?.[filterTerm]?.toString()?.toLocaleLowerCase() || "";

  if (Array.isArray(filterValue)) {
    return filterValue.map((value) => value?.toString().toLocaleLowerCase()).includes(itemValue);
  }

  return filterValue?.toString()?.toLocaleLowerCase() == itemValue;
};

export const filterItemsByTerm = <D>(
  hits: TestHit<D>[],
  filterTerm: keyof D,
  filterValue: string | string[],
): TestHit<D>[] => {
  return hits.filter(
    (hit) =>
      (hit as TestHit<D>)?._source && matchFilter<D>(hit._source as D, filterTerm, filterValue),
  );
};

export const getAggregations = (
  aggs: Record<string, QueryAggs>,
  isSpa: boolean = true,
): TestAggResult => {
  const aggregations: TestAggResult = {};

  if (aggs?.["stateStatus.keyword"]) {
    aggregations["stateStatus.keyword"] = {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [
        { key: "Submitted", doc_count: 56 },
        { key: "Withdrawal Requested", doc_count: 3 },
      ],
    };
  }

  if (aggs?.["origin.keyword"]) {
    aggregations["origin.keyword"] = {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [{ key: "OneMAC", doc_count: 59 }],
    };
  }

  if (aggs?.["state.keyword"]) {
    aggregations["state.keyword"] = {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [
        { key: "CO", doc_count: 5 },
        { key: "MD", doc_count: 41 },
        { key: "OH", doc_count: 12 },
        { key: "VA", doc_count: 1 },
      ],
    };
  }

  if (aggs?.["leadAnalystName.keyword"]) {
    aggregations["leadAnalystName.keyword"] = {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [
        { key: "George Harrison", doc_count: 1 },
        { key: "Padma Boggarapu", doc_count: 19 },
        { key: "Shante Abarabar", doc_count: 1 },
      ],
    };
  }

  if (aggs?.["actionType.keyword"]) {
    aggregations["actionType.keyword"] = {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: isSpa
        ? [{ key: "Amend", doc_count: 31 }]
        : [
            { key: "Amend", doc_count: 20 },
            { key: "Extend", doc_count: 10 },
            { key: "Initial", doc_count: 7 },
            { key: "New", doc_count: 15 },
            { key: "Renew", doc_count: 7 },
          ],
    };
  }

  if (aggs?.["authority.keyword"]) {
    aggregations["authority.keyword"] = {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: isSpa
        ? [
            { key: "CHIP SPA", doc_count: 31 },
            { key: "Medicaid SPA", doc_count: 90 },
          ]
        : [
            { key: "1915(b)", doc_count: 48 },
            { key: "1915(c)", doc_count: 11 },
          ],
    };
  }
  return aggregations;
};
