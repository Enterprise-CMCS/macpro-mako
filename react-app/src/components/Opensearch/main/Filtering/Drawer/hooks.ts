import { useState, useEffect, useMemo } from "react";
import { useGetUser } from "@/api";
import { UserRoles, opensearch } from "shared-types";

import * as C from "./consts";
import { useLabelMapping } from "@/hooks";
import { useFilterDrawerContext } from "../FilterProvider";
import { checkMultiFilter, useOsAggregate, useOsUrl } from "@/components";

type FilterGroup = Partial<Record<opensearch.main.Field, C.DrawerFilterableGroup>>;

export const FILTER_STORAGE_KEY = "osFilter";

export const useFilterState = () => {
  const { data: user } = useGetUser();
  const url = useOsUrl();

  const isCms = !!user?.isCms && !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK);

  const filters: FilterGroup = (() => {
    // ------------------------ SPAS ------------------------ //
    if (url.state.tab === "spas") {
      return {
        [C.SELECT_STATE.field]: C.SELECT_STATE,
        [C.CHECK_AUTHORITY.field]: C.CHECK_AUTHORITY,
        ...(() => {
          if (isCms) return { [C.CHECK_CMSSTATUS.field]: C.CHECK_CMSSTATUS };
          return { [C.CHECK_STATESTATUS.field]: C.CHECK_STATESTATUS };
        })(),
        [C.BOOL_RAIWITHDRAWENABLED.field]: C.BOOL_RAIWITHDRAWENABLED,
        [C.DATE_INITIALSUBMISSION.field]: C.DATE_INITIALSUBMISSION,
        [C.DATE_FINALDISPOSITION.field]: C.DATE_FINALDISPOSITION,
        [C.DATE_LATESTPACKAGEACTIVITY.field]: C.DATE_LATESTPACKAGEACTIVITY,
        [C.DATE_RAIRECEIVED.field]: C.DATE_RAIRECEIVED,
        [C.SELECT_CPOC.field]: C.SELECT_CPOC,
        [C.SELECT_ORIGIN.field]: C.SELECT_ORIGIN,
      };
    }

    // ------------------------ WAIVERS ------------------------ //
    if (url.state.tab === "waivers") {
      return {
        [C.SELECT_STATE.field]: C.SELECT_STATE,
        [C.CHECK_AUTHORITY.field]: C.CHECK_AUTHORITY,
        [C.CHECK_ACTIONTYPE.field]: C.CHECK_ACTIONTYPE,
        ...(() => {
          if (isCms) return { [C.CHECK_CMSSTATUS.field]: C.CHECK_CMSSTATUS };
          return { [C.CHECK_STATESTATUS.field]: C.CHECK_STATESTATUS };
        })(),
        [C.BOOL_RAIWITHDRAWENABLED.field]: C.BOOL_RAIWITHDRAWENABLED,
        [C.DATE_INITIALSUBMISSION.field]: C.DATE_INITIALSUBMISSION,
        [C.DATE_FINALDISPOSITION.field]: C.DATE_FINALDISPOSITION,
        [C.DATE_LATESTPACKAGEACTIVITY.field]: C.DATE_LATESTPACKAGEACTIVITY,
        [C.DATE_RAIRECEIVED.field]: C.DATE_RAIRECEIVED,
        [C.SELECT_CPOC.field]: C.SELECT_CPOC,
        [C.SELECT_ORIGIN.field]: C.SELECT_ORIGIN,
      };
    }

    return {};
  })();

  return useState(filters);
};

export const useFilterDrawer = () => {
  const url = useOsUrl();
  const drawer = useFilterDrawerContext();
  const [filters, setFilters] = useFilterState();

  const [accordionValues, setAccordionValues] = useState<string[]>([]);
  const labelMap = useLabelMapping();
  const _aggs = useOsAggregate();

  const onFilterChange = (field: opensearch.main.Field) => {
    return (value: opensearch.FilterValue) => {
      setFilters((state) => {
        const updateState = { ...state, [field]: { ...state[field], value } };
        // find all filter values to update
        const updateFilters = Object.values(updateState).filter((FIL) => {
          if (FIL.type === "terms") {
            const value = FIL.value as string[];
            return value?.length;
          }

          if (FIL.type === "range") {
            const value = FIL.value as opensearch.RangeValue;
            return !!value?.gte && !!value?.lte;
          }

          if (FIL.type === "match") {
            if (FIL.value === null) return false;
          }

          return true;
        });
        localStorage.setItem(
          FILTER_STORAGE_KEY,
          JSON.stringify({ filters: updateFilters, tab: url.state.tab }),
        );

        // this changes the tanstack query; which is used to query the data
        url.onSet((state) => ({
          ...state,
          filters: updateFilters,
          pagination: { ...state.pagination, number: 0 },
        }));

        return updateState;
      });
    };
  };

  const onAccordionChange = (updateAccordion: string[]) => {
    setAccordionValues(updateAccordion);
  };

  const onFilterReset = () => {
    url.onSet((s) => ({
      ...s,
      filters: [],
      pagination: { ...s.pagination, number: 0 },
    }));
    localStorage.removeItem(FILTER_STORAGE_KEY);
  };

  const filtersApplied = checkMultiFilter(url.state.filters, 1);

  // on filter initialization
  useEffect(() => {
    // check if any filters where saved in storage
    const filterState: { filters: C.DrawerFilterableGroup[]; tab: string } | null = JSON.parse(
      localStorage.getItem(FILTER_STORAGE_KEY),
    );

    if (!filterState) return;

    // we should delete the local storage if it doesn't match current tab
    if (filterState.tab !== url.state.tab) {
      localStorage.removeItem(FILTER_STORAGE_KEY);
      return;
    }

    // this changes the tanstack query; which is used to query the data
    url.onSet((state) => ({
      ...state,
      filters: filterState.filters,
      pagination: { ...state.pagination, number: 0 },
    }));

    // eslint-disable-next-line
  }, []);

  // update filter display based on url query
  useEffect(() => {
    if (!drawer.drawerOpen) return;

    const updateAccordions = [...accordionValues] as any[];
    setFilters((currentFilters) => {
      // Set the new filters state based on the current filter data
      return Object.entries(currentFilters).reduce((STATE, [KEY, VAL]) => {
        const updateFilter = url.state.filters.find((FIL) => FIL.field === KEY);

        // Determine the new value for the filter based on the URL state
        const value = (() => {
          if (updateFilter) {
            updateAccordions.push(KEY);
            return updateFilter.value;
          }
          if (VAL.type === "terms") return [] as string[];
          if (VAL.type === "match") return null;
          return { gte: undefined, lte: undefined } as opensearch.RangeValue;
        })();

        // Update the state with the new value for this filter
        STATE[KEY] = { ...VAL, value };

        return STATE;
      }, {} as any);
    });
    setAccordionValues(updateAccordions);

    // eslint-disable-next-line
  }, [url.state.filters, drawer.drawerOpen]);

  const aggs = useMemo(() => {
    return Object.entries(_aggs || {}).reduce(
      (STATE, [KEY, AGG]) => {
        return {
          ...STATE,
          [KEY]: AGG.buckets
            .map((BUCK) => ({
              label: `${labelMap[BUCK.key] || BUCK.key}`,
              value: BUCK.key,
            }))
            .sort((a, b) => Intl.Collator("en").compare(a.value, b.value)),
        };
      },
      {} as Record<opensearch.main.Field, { label: string; value: string }[]>,
    );
  }, [_aggs, labelMap]);

  return {
    aggs,
    drawer,
    accordionValues,
    filters,
    filtersApplied,
    onFilterReset,
    onFilterChange,
    onAccordionChange,
  };
};
