import { QueryContainer, TermQuery, TermsQuery, TestHit } from "../../index.d";

export const getFilterValue = (
  query: QueryContainer | QueryContainer[] | undefined,
  filterName: string,
): string | string[] | undefined => {
  if (query) {
    const rule: QueryContainer | undefined = Array.isArray(query)
      ? (query as QueryContainer[]).find(
          (rule) =>
            rule?.term?.[filterName] !== undefined || rule?.terms?.[filterName] !== undefined,
        )
      : (query as QueryContainer);

    if (rule?.term?.[filterName]) {
      return rule.term[filterName].toString();
    }

    if (rule?.terms?.[filterName]) {
      return rule.terms[filterName].map((value: string) => value?.toString());
    }
  }
  return;
};

export const getFilterKeys = (query: QueryContainer[] | QueryContainer): string[] => {
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
