import { useState, useEffect, useMemo } from "react";

import * as Consts from "./consts";
import { useOsAggregate, useOsUrl } from "../useOpensearch";
import { opensearch } from "shared-types";
import { useLabelMapping } from "@/hooks";
import { useFilterDrawerContext } from "./FilterProvider";
import { useGetUser } from "@/api/useGetUser";

export const useFilterDrawer = () => {
  const { drawerOpen, setDrawerState } = useFilterDrawerContext();
  const { data: user } = useGetUser();
  const url = useOsUrl();
  const [filters, setFilters] = useState(
    Consts.FILTER_GROUPS(user, url.state.tab)
  );
  const [accordionValues, setAccordionValues] = useState<string[]>([]);
  const labelMap = useLabelMapping();
  const _aggs = useOsAggregate();

  const onFilterChange = (field: opensearch.main.Field) => {
    return (value: opensearch.FilterValue) => {
      setFilters((state) => {
        const updateState = { ...state, [field]: { ...state[field], value } };
        const updateFilters = Object.values(updateState).filter((FIL) => {
          if (FIL.type === "terms") {
            const value = FIL.value as string[];
            return value?.length;
          }

          if (FIL.type === "range") {
            const value = FIL.value as opensearch.RangeValue;
            return !!value?.gte && !!value?.lte;
          }

          return true;
        });

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

  // update initial filter state + accordion default open items
  useEffect(() => {
    if (drawerOpen) return;
    const updateAccordions = [] as any[];

    setFilters((s) => {
      return Object.entries(s).reduce((STATE, [KEY, VAL]) => {
        const updateFilter = url.state.filters.find((FIL) => FIL.field === KEY);

        const value = (() => {
          if (updateFilter) {
            updateAccordions.push(KEY);
            return updateFilter.value;
          }
          if (VAL.type === "terms") return [] as string[];
          return { gte: undefined, lte: undefined } as opensearch.RangeValue;
        })();

        STATE[KEY] = { ...VAL, value };

        return STATE;
      }, {} as any);
    });
    setAccordionValues(updateAccordions);
  }, [url.state.filters, drawerOpen]);

  // change base filters per tab
  useEffect(() => {
    setFilters(Consts.FILTER_GROUPS(user, url.state.tab));
  }, [url.state.tab]);

  const aggs = useMemo(() => {
    return Object.entries(_aggs || {}).reduce((STATE, [KEY, AGG]) => {
      return {
        ...STATE,
        [KEY]: AGG.buckets.map((BUCK) => ({
          label: `${labelMap[BUCK.key] || BUCK.key}`,
          value: BUCK.key,
        })),
      };
    }, {} as Record<opensearch.main.Field, { label: string; value: string }[]>);
  }, [_aggs]);

  return {
    aggs,
    drawerOpen,
    accordionValues,
    filters,
    onFilterChange,
    setDrawerState,
    onAccordionChange,
  };
};
