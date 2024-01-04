import { getOsData, useOsSearch } from "@/api";
import { useLzUrl } from "@/hooks/useParams";
import { useEffect, useState } from "react";
import { UserRoles, opensearch } from "shared-types";
import { createSearchFilterable } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { useGetUser } from "@/api/useGetUser";
import { OsTab } from "./types";

export const DEFAULT_FILTERS: Record<OsTab, Partial<OsUrlState>> = {
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
@summary
use with main
Comments
- TODO: add index scope
- FIX: Initial render fires useEffect twice - 2 os requests
 */
export const useOsData = () => {
  const params = useOsUrl();
  const [data, setData] = useState<opensearch.main.Response["hits"]>();
  const { mutateAsync, isLoading, error } = useOsSearch<
    opensearch.main.Field,
    opensearch.main.Response
  >();
  const onRequest = async (query: opensearch.main.State, options?: any) => {
    try {
      await mutateAsync(
        {
          index: "main",
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
  const { state } = useOsUrl();
  const aggs = useQuery({
    refetchOnWindowFocus: false,
    queryKey: [state.tab],
    queryFn: (props) => {
      return getOsData({
        index: "main",
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
            field:
              user?.isCms &&
              !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
                ? "cmsStatus.keyword"
                : "stateStatus.keyword",
            name:
              user?.isCms &&
              !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
                ? "cmsStatus.keyword"
                : "stateStatus.keyword",
            type: "terms",
            size: 10,
          },
          {
            field: "leadAnalystName.keyword",
            name: "leadAnalystName.keyword",
            type: "terms",
            size: 1000,
          },
        ],
        filters: DEFAULT_FILTERS[props.queryKey[0]].filters || [],
        pagination: { number: 0, size: 1 },
      });
    },
  });
  return aggs.data?.aggregations;
};
export type OsUrlState = opensearch.main.State & { tab: OsTab };
export const useOsUrl = () => {
  return useLzUrl<OsUrlState>({
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
