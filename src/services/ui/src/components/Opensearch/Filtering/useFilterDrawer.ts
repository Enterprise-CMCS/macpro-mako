import { useState, useEffect, useMemo } from "react";
import type { OsField } from "./types";
import * as Consts from "./consts";
import { useOsAggregate, useOsParams } from "../useOpensearch";
import { OsFilterValue, OsRangeValue } from "shared-types";
import { useLabelMapping } from "@/hooks/useLabelMappings";

export const useFilterDrawer = () => {
  const [filters, setFilters] = useState(Consts.FILTER_GROUPS);
  const [open, setOpen] = useState(false);
  const [accordionValues, setAccordionValues] = useState<string[]>([]);
  const params = useOsParams();
  const labelMap = useLabelMapping();
  const _aggs = useOsAggregate();

  const onClose = (updateOpen: boolean): void => {
    setOpen(updateOpen);
    if (updateOpen) return;

    const updateFilters = Object.values(filters).filter((FIL) => {
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
  };

  const onChange = (field: OsField) => {
    return (value: OsFilterValue) => {
      setFilters((state: any) => {
        const copyState = { ...state };
        copyState[field] = { ...copyState[field], value };
        return copyState;
      });
    };
  };

  const onAccordionChange = (updateAccordion: string[]) => {
    setAccordionValues(updateAccordion);
  };

  // update initial filter state + accordion default open items
  useEffect(() => {
    if (!open) return;
    const updateAccordions = [] as any[];

    setFilters((state: any) => {
      const copy = { ...state };

      params.state.filters.forEach((FIL) => {
        if (FIL.type === "terms") {
          const value = FIL.value as string[];
          if (value.length) updateAccordions.push(FIL.field);
        }

        if (FIL.type === "range") {
          const value = FIL.value as OsRangeValue;
          if (!!value?.gte && !!value?.lte) updateAccordions.push(FIL.field);
        }

        copy[FIL.field] = {
          ...(state[FIL.field] && state[FIL.field]),
          value: FIL.value,
        };
      });

      return copy;
    });
    setAccordionValues(updateAccordions);
  }, [open]);

  const aggs = useMemo(() => {
    return Object.entries(_aggs || {}).reduce((STATE, [KEY, AGG]) => {
      return {
        ...STATE,
        [KEY]: AGG.buckets.map((BUCK) => ({
          label: `${labelMap[BUCK.key] || BUCK.key} (${BUCK.doc_count})`,
          value: BUCK.key,
        })),
      };
    }, {} as Record<OsField, { label: string; value: string }[]>);
  }, [_aggs]);

  return {
    aggs,
    open,
    accordionValues,
    filters,
    onChange,
    onClose,
    onAccordionChange,
  };
};
