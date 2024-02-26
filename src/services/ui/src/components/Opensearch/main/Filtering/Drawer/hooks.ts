import { useState, useEffect, useMemo } from "react";
import { useGetUser } from "@/api/useGetUser";
import { UserRoles } from "shared-types";

import * as C from "./consts";
import { useOsAggregate, useOsUrl } from "../../useOpensearch";
import { opensearch } from "shared-types";
import { useLabelMapping } from "@/hooks";
import { useFilterDrawerContext } from "../FilterProvider";
import { checkMultiFilter } from "@/components/Opensearch";

type FilterGroup = Partial<
  Record<opensearch.main.Field, C.DrawerFilterableGroup>
>;

export const useFilterState = () => {
  const { data: user } = useGetUser();
  const url = useOsUrl();

  const isCms =
    !!user?.isCms &&
    !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK);

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
        ...(!!user?.isCms && {
          [C.BOOL_INITIALINTAKENEEDED.field]: C.BOOL_INITIALINTAKENEEDED,
        }),
        [C.DATE_SUBMISSION.field]: C.DATE_SUBMISSION,
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
        ...(!!user?.isCms && {
          [C.BOOL_INITIALINTAKENEEDED.field]: C.BOOL_INITIALINTAKENEEDED,
        }),
        [C.DATE_SUBMISSION.field]: C.DATE_SUBMISSION,
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

  const onFilterReset = () =>
    url.onSet((s) => ({
      ...s,
      filters: [],
      pagination: { ...s.pagination, number: 0 },
    }));

  const filtersApplied = checkMultiFilter(url.state.filters, 1);

  // update initial filter state + accordion default open items
  useEffect(() => {
    if (!drawer.drawerOpen) return;
    const updateAccordions = [...accordionValues] as any[];

    setFilters((s) => {
      return Object.entries(s).reduce((STATE, [KEY, VAL]) => {
        const updateFilter = url.state.filters.find((FIL) => FIL.field === KEY);

        const value = (() => {
          if (updateFilter) {
            updateAccordions.push(KEY);
            return updateFilter.value;
          }
          if (VAL.type === "terms") return [] as string[];
          if (VAL.type === "match") return null;
          return { gte: undefined, lte: undefined } as opensearch.RangeValue;
        })();

        STATE[KEY] = { ...VAL, value };
        return STATE;
      }, {} as any);
    });
    setAccordionValues(updateAccordions);
  }, [url.state.filters, drawer.drawerOpen]);

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
    drawer,
    accordionValues,
    filters,
    filtersApplied,
    onFilterReset,
    onFilterChange,
    onAccordionChange,
  };
};
