import { useOsSearch } from "@/api";
import { useParams } from "@/hooks/useParams";
import { useEffect } from "react";
import { OsQueryState } from "shared-types";
import { createSearchFilterable } from "./utils";

/**
 *
 * @summary
 * use with main
 * Comments
 * - TODO: add index scope
 * - FIX: Initial render fires useEffect twice - 2 os requests
 */
export const useOsQuery = (init?: Partial<OsQueryState>) => {
  const params = useOsParams(init);
  const { data, mutateAsync, isLoading, error } = useOsSearch();

  const onRequest = async (query: OsQueryState, options?: any) => {
    try {
      await mutateAsync(
        {
          pagination: query.pagination,
          ...(!query.search && { sort: query.sort }),
          filters: [
            ...query.filters,
            ...createSearchFilterable(query.search || ""),
          ],
        },
        options
      );
    } catch (error) {
      console.error("Error occurred during search:", error);
    }
  };

  useEffect(() => {
    onRequest(params.state);
  }, [params.queryString]);

  return { data, isLoading, error, ...params };
};

export const useOsParams = (init?: Partial<OsQueryState>) => {
  return useParams<OsQueryState>({
    key: "os",
    initValue: {
      filters: [],
      search: "",
      pagination: { number: 0, size: 100 },
      sort: { field: "changedDate", order: "desc" },
      ...(!!init && init),
    },
  });
};
