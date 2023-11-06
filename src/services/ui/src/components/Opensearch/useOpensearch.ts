import { getSearchData, useOsSearch } from "@/api";
import { useParams } from "@/hooks/useParams";
import { useEffect, useState } from "react";
import { OsQueryState, SearchData, UserRoles } from "shared-types";
import { createSearchFilterable } from "./utils";
import { useQuery } from "@tanstack/react-query";
import { useGetUser } from "@/api/useGetUser";

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
export const useOsQuery = () => {
  const params = useOsParams();
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
        { ...options, onSuccess: (res) => setData(res.hits) }
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

export const useOsAggregate = () => {
  const { data: user } = useGetUser();
  const { state } = useOsParams();
  const aggs = useQuery({
    refetchOnWindowFocus: false,
    queryKey: [state.tab],
    queryFn: (props) => {
      return getSearchData({
        aggs: [
          {
            field: "state.keyword",
            type: "terms",
            name: "state.keyword",
            size: 60,
          },
          {
            field: "planType.keyword",
            type: "terms",
            name: "planType.keyword",
            size: 10,
          },
          {
            field: "actionType.keyword",
            type: "terms",
            name: "actionType.keyword",
            size: 10,
          },
          {
            field: user?.isCms ? "cmsStatus.keyword" : "stateStatus.keyword",
            name: user?.isCms ? "cmsStatus.keyword" : "stateStatus.keyword",
            type: "terms",
            size: 10,
          },
          {
            field: "leadAnalystName.keyword",
            name: "leadAnalystName.keyword",
            type: "terms",
            size: 200,
          },
        ],
        filters: DEFAULT_FILTERS[props.queryKey[0]].filters || [],
        pagination: { number: 0, size: 1 },
      });
    },
  });

  return aggs.data?.aggregations;
};

export type OsParamsState = OsQueryState & { tab: OsTab };

export const useOsParams = () => {
  return useParams<OsParamsState>({
    key: "os",
    initValue: {
      filters: [],
      search: "",
      tab: "spas",
      pagination: { number: 0, size: 25 },
      sort: { field: "changedDate", order: "desc" },
    },
  });
};
