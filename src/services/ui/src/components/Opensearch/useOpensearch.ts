import { useOsSearch } from "@/api";
import { useParams } from "@/hooks/useParams";
import { useEffect, useState } from "react";
import { OsQueryState, SearchData } from "shared-types";
import { createSearchFilterable } from "./utils";

export type OsTab = "waivers" | "spas";

export const DEFAULT_FILTERS: Record<OsTab, Partial<OsParamsState>> = {
  spas: {
    filters: [
      {
        field: "authority.keyword",
        type: "terms",
        value: ["CHIP", "MEDICAID"],
        prefix: "must",
      },
    ],
  },
  waivers: {
    filters: [
      {
        field: "authority.keyword",
        type: "terms",
        value: ["WAIVER"],
        prefix: "must",
      },
    ],
  },
};

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
  const [data, setData] = useState<SearchData>();
  const { mutateAsync, isLoading, error } = useOsSearch();

  const onRequest = async (query: OsQueryState, options?: any) => {
    try {
      await mutateAsync(
        {
          pagination: query.pagination,
          ...(!query.search && { sort: query.sort }),
          filters: [
            ...query.filters,
            ...createSearchFilterable(query.search || ""),
            ...(DEFAULT_FILTERS[params.state.tab].filters || []),
          ],
        },
        { ...options, onSuccess: setData }
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

export type OsParamsState = OsQueryState & { tab: OsTab };

export const useOsParams = (init?: Partial<OsParamsState>) => {
  return useParams<OsParamsState>({
    key: "os",
    initValue: {
      filters: [],
      search: "",
      tab: "spas",
      pagination: { number: 0, size: 100 },
      sort: { field: "changedDate", order: "desc" },
    },
  });
};
