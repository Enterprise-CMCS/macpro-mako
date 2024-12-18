import { QueryContainer, TermQuery, TermsQuery, TestHit } from "../../index.d";

export const getFilterValue = (
  query: QueryContainer | QueryContainer[] | undefined,
  queryKey: keyof QueryContainer,
  filterName: string,
): string | string[] | undefined => {
  if (query) {
    const rules: QueryContainer[] = (Array.isArray(query)) ? query : [query];
    const values: string[] = [];
    rules.forEach(rule => {
      if (rule?.[queryKey]?.[filterName] !== undefined) {
        if (Array.isArray(rule[queryKey][filterName])) {
          rule[queryKey][filterName].forEach(value => {
            if (value !== undefined) {
              values.push(value.toString())
            }
          })
        } else {
          values.push(rule[queryKey][filterName].toString());
        }
      }
    })

    if (values.length === 0) return undefined;
    if (values.length === 1) return values[0].toString();

    return values.map(value => value.toString());
  }
  return undefined;
};

export const getTermValues = (
  query: QueryContainer | QueryContainer[] | undefined,
  filterName: string,
): string | string[] | undefined => {
  const term = getFilterValue(query, 'term', filterName);
  const terms = getFilterValue(query, 'terms', filterName);

  if (term && terms) {
    const values: string[] = [];
    values.concat(Array.isArray(term) ? term : [term])
    values.concat(Array.isArray(terms) ? terms : [terms]);
    return values;
  }
  
  return term || terms;
}

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
        filterKeys.push(...Object.keys((query.term as Record<string, TermQuery>)));
      }
      if ((query as QueryContainer)?.terms !== undefined) {
        filterKeys.push(...Object.keys((query.terms as TermsQuery)));
      }
    }
  }
  return filterKeys;
};

export const matchFilter = <T>(
  item: T | null | undefined,
  filterTerm: keyof T | null | undefined,
  filterValue: string | string[] | null | undefined,
): boolean  => {
  if (!item || !filterTerm || !filterValue) {
    return false;
  }

  const itemValue = item?.[filterTerm]?.toString()?.toLocaleLowerCase() || "";

  if (Array.isArray(filterValue)) {
    return filterValue.map((value) => value?.toString().toLocaleLowerCase()).includes(itemValue);
  }

  return filterValue?.toString()?.toLocaleLowerCase() == itemValue;
}

export const filterItemsByTerm = <D>(
  hits: TestHit<D>[],
  filterTerm: keyof D,
  filterValue: string | string[]
): TestHit<D>[] => {
  return hits.filter(
    (hit) => (hit as TestHit<D>)?._source && matchFilter<D>((hit._source as D), filterTerm, filterValue)
  )
}
