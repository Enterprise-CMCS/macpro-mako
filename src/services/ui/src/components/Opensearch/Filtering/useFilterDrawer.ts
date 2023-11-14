import { useState, useEffect, useMemo } from "react";
import type { OsField } from "./types";
import * as Consts from "./consts";
import { useOsAggregate, useOsParams } from "../useOpensearch";
import { OsFilterValue, OsRangeValue } from "shared-types";
import { useLabelMapping } from "@/hooks";
import { useFilterDrawerContext } from "./FilterProvider";
import { useGetUser } from "@/api/useGetUser";

export const useFilterDrawer = () => {
  const { drawerOpen, setDrawerState } = useFilterDrawerContext();
  const { data: user } = useGetUser();
  const [filters, setFilters] = useState(Consts.FILTER_GROUPS(user?.isCms));
  const [accordionValues, setAccordionValues] = useState<string[]>([]);
  const params = useOsParams();
  const labelMap = useLabelMapping();
  const _aggs = useOsAggregate();

  const onFilterChange = (field: OsField) => {
    // console.log(field);
    return (value: OsFilterValue) => {
      setFilters((state) => {
        const updateState = { ...state, [field]: { ...state[field], value } };
        const updateFilters = Object.values(updateState).filter((FIL) => {
          if (FIL.type === "terms") {
            const value = FIL.value as string[];
            return value?.length;
          }

          if (FIL.type === "range") {
            const value = FIL.value as OsRangeValue;
            return !!value?.gte && !!value?.lte;
          }

          return true;
        });

        params.onSet((state) => ({
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
        const updateFilter = params.state.filters.find(
          (FIL) => FIL.field === KEY
        );

        const value = (() => {
          if (updateFilter) {
            updateAccordions.push(KEY);
            return updateFilter.value;
          }
          if (VAL.type === "terms") return [] as string[];
          return { gte: undefined, lte: undefined } as OsRangeValue;
        })();

        STATE[KEY] = { ...VAL, value };

        return STATE;
      }, {} as any);
    });
    setAccordionValues(updateAccordions);
  }, [params.state.filters, drawerOpen]);

  const aggs = useMemo(() => {
    return Object.entries(_aggs || {}).reduce((STATE, [KEY, AGG]) => {
      return {
        ...STATE,
        [KEY]: AGG.buckets.map((BUCK) => ({
          label: `${labelMap[BUCK.key] || BUCK.key}`,
          value: BUCK.key,
        })),
      };
    }, {} as Record<OsField, { label: string; value: string }[]>);
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
