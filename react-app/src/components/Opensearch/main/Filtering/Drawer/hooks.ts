import { useEffect, useMemo, useState } from "react";
import { opensearch } from "shared-types";

import { useGetUser } from "@/api";
import { checkMultiFilter, useOsAggregate, useOsUrl } from "@/components";
import { useLabelMapping } from "@/hooks";

import { useFilterDrawerContext } from "../FilterProvider";
import * as C from "./consts";

type FilterGroup = Partial<Record<opensearch.main.Field, C.DrawerFilterableGroup>>;

export const useFilterState = () => {
  const { data: user } = useGetUser();
  const url = useOsUrl();

  const isCms = !!user?.isCms && user.user?.role !== "helpdesk";

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
  };

  const filtersApplied = checkMultiFilter(url.state.filters, 1);

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
    // accordionValues is intensionally left out of this dependency array because it could cause looping
  }, [url.state.filters, drawer.drawerOpen, setFilters]); // eslint-disable-line react-hooks/exhaustive-deps

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
