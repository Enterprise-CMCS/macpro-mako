import { SearchTerm } from "../../index.d";

export const getFilterValue = (
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

export const getFilterKeys = (query: SearchTerm[] | SearchTerm): string[] => {
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

export function matchFilter<T>(
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
