import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { opensearch, UserRoles } from "shared-types";

import { getOsData, useGetUser, useOsSearch } from "@/api";
import { useLzUrl } from "@/hooks";

import { createSearchFilterable } from "../utils";
import { OsTab } from "./types";

export const DEFAULT_FILTERS: Record<OsTab, Partial<OsUrlState>> = {
  spas: {
    filters: [
      {
        field: "authority.keyword",
        type: "terms",
        value: ["Medicaid SPA", "CHIP SPA"],
        prefix: "must",
      },
    ],
  },
  waivers: {
    filters: [
      {
        field: "authority.keyword",
        type: "terms",
        value: ["1915(b)", "1915(c)"],
        prefix: "must",
      },
      // {
      //   field: "appkParentId",
      //   type: "exists",
      //   value: true,
      //   prefix: "must_not",
      // },
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

  const [tabLoading, setTabLoading] = useState(false);
  const previousTab = useRef(params.state.tab);

  const onRequest = async (query: opensearch.main.State, options?: any) => {
    try {
      if (params.state.tab !== previousTab.current) {
        setTabLoading(true);
        previousTab.current = params.state.tab;
      }

      await mutateAsync(
        {
          index: "main",
          pagination: query.pagination,
          sort: query.sort,
          filters: [
            ...query.filters,
            ...createSearchFilterable(query.search || ""),
            ...(DEFAULT_FILTERS[params.state.tab].filters || []),
          ],
        },
        {
          ...options,
          onSuccess: (res) => {
            setData(res.hits);
            setTabLoading(false);
          },
        },
      );
    } catch (error) {
      console.error("Error occurred during search:", error);
      setTabLoading(false);
    }
  };
  useEffect(() => {
    onRequest(params.state);
  }, [params.queryString]);
  return { data, isLoading, error, ...params, tabLoading };
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
            field: "authority.keyword",
            type: "terms",
            name: "authority.keyword",
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
              user?.isCms && !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
                ? "cmsStatus.keyword"
                : "stateStatus.keyword",
            name:
              user?.isCms && !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryObject = Object.fromEntries(queryParams.entries());

  return useLzUrl<OsUrlState>({
    key: "os",
    initValue: {
      filters: [],
      search: "",
      tab: "spas",
      pagination: { number: 0, size: 25 },
      sort: { field: "makoChangedDate", order: "desc" },
      ...queryObject,
    },
    redirectTab: queryObject?.tab,
  });
};
