import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { opensearch, SEATOOL_STATUS } from "shared-types";

import { getOsData, useGetUser, useOsSearch } from "@/api";
import { useLzUrl } from "@/hooks";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

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

export const OS_DASHBOARD_REFRESH_EVENT = "os-dashboard-refresh";

const DASHBOARD_DRAFT_STATUS_FIELDS = new Set<opensearch.main.Field>([
  "seatoolStatus.keyword",
  "stateStatus.keyword",
  "cmsStatus.keyword",
]);

export const EXCLUDE_DRAFT_STATUS_FILTER: opensearch.main.Filterable = {
  field: "seatoolStatus.keyword",
  type: "term",
  value: SEATOOL_STATUS.DRAFT,
  prefix: "must_not",
};

const isDraftStatusFilter = (filter: opensearch.main.Filterable) =>
  filter.type === "terms" &&
  DASHBOARD_DRAFT_STATUS_FIELDS.has(filter.field) &&
  Array.isArray(filter.value) &&
  filter.value.includes(SEATOOL_STATUS.DRAFT);

export const removeDraftStatusFilters = (
  filters: opensearch.main.Filterable[] = [],
): opensearch.main.Filterable[] =>
  filters.flatMap((filter) => {
    if (!isDraftStatusFilter(filter)) {
      return [filter];
    }

    const value = (filter.value as string[]).filter((status) => status !== SEATOOL_STATUS.DRAFT);
    return value.length ? [{ ...filter, value }] : [];
  });

export const getSaveInProgressDashboardFilters = (
  isSaveInProgressEnabled: boolean,
): opensearch.main.Filterable[] => (isSaveInProgressEnabled ? [] : [EXCLUDE_DRAFT_STATUS_FILTER]);

export const getDashboardSearchFilters = ({
  filters,
  search,
  tab,
  isSaveInProgressEnabled,
}: {
  filters: opensearch.main.Filterable[];
  search?: string;
  tab: OsTab;
  isSaveInProgressEnabled: boolean;
}): opensearch.main.Filterable[] => [
  ...(isSaveInProgressEnabled ? filters : removeDraftStatusFilters(filters)),
  ...createSearchFilterable(search || ""),
  ...(DEFAULT_FILTERS[tab].filters || []),
  ...getSaveInProgressDashboardFilters(isSaveInProgressEnabled),
];

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
  const isSaveInProgressEnabled = useFeatureFlag("SAVE_IN_PROGRESS");
  const [data, setData] = useState<opensearch.main.Response["hits"]>();
  const { mutateAsync, isLoading, error } = useOsSearch<
    opensearch.main.Field,
    opensearch.main.Response
  >();

  const [tabLoading, setTabLoading] = useState(false);
  const previousTab = useRef(params.state.tab);

  const onRequest = async (
    query: opensearch.main.State,
    options?: Parameters<typeof mutateAsync>[1],
  ) => {
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
          filters: getDashboardSearchFilters({
            filters: query.filters,
            search: query.search,
            tab: params.state.tab,
            isSaveInProgressEnabled,
          }),
          includeDrafts: isSaveInProgressEnabled,
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
  }, [params.queryString]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleDashboardRefresh = () => {
      onRequest(params.state);
    };

    window.addEventListener(OS_DASHBOARD_REFRESH_EVENT, handleDashboardRefresh);
    return () => {
      window.removeEventListener(OS_DASHBOARD_REFRESH_EVENT, handleDashboardRefresh);
    };
  }, [params.queryString]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    isLoading,
    error,
    ...params,
    tabLoading,
  };
};
export const useOsAggregate = () => {
  const { data: user } = useGetUser();
  const { state } = useOsUrl();
  const isSaveInProgressEnabled = useFeatureFlag("SAVE_IN_PROGRESS");
  const aggs = useQuery({
    refetchOnWindowFocus: false,
    queryKey: [state.tab, isSaveInProgressEnabled],
    queryFn: () => {
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
              user?.isCms && user.user?.role !== "helpdesk"
                ? "cmsStatus.keyword"
                : "stateStatus.keyword",
            name:
              user?.isCms && user.user?.role !== "helpdesk"
                ? "cmsStatus.keyword"
                : "stateStatus.keyword",
            type: "terms",
            size: 20,
          },
          {
            field: "leadAnalystName.keyword",
            name: "leadAnalystName.keyword",
            type: "terms",
            size: 1000,
          },
        ],
        filters: [
          ...(DEFAULT_FILTERS[state.tab].filters || []),
          ...getSaveInProgressDashboardFilters(isSaveInProgressEnabled),
        ],
        pagination: { number: 0, size: 1 },
        includeDrafts: isSaveInProgressEnabled,
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
      pagination: { number: 0, size: 100 },
      sort: { field: "makoChangedDate", order: "desc" },
      ...queryObject,
    },
    redirectTab: queryObject?.tab,
  });
};
