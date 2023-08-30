import { useState, useEffect } from "react";
import type { OsField } from "./types";
import * as Consts from "./consts";
import { useOsParams } from "../useOpensearch";
import { OsFilterType, OsFilterValue, OsRangeValue } from "shared-types";

export const useDrawer = () => {
  const [filters, setFilters] = useState(Consts.FILTER_GROUPS);
  const [open, setOpen] = useState(false);
  const [accordionValues, setAccordionValues] = useState<OsField[]>([]);
  const params = useOsParams();

  const onClose = (updateOpen: boolean): void => {
    if (!updateOpen) {
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

      params.onSet((_) => ({
        ..._,
        filters: updateFilters,
        pagination: { ..._.pagination, number: 0 },
      }));
    }
    setOpen(updateOpen);
  };

  const onChange = (type: OsFilterType, field: OsField) => {
    return (value: OsFilterValue) => {
      setFilters((s: any) => {
        const copyState = { ...s };
        if (type === "terms") {
          copyState[field] = { ...copyState[field], value };
        }

        if (type === "range") {
          copyState[field] = { ...copyState[field], value };
        }

        return copyState;
      });
    };
  };

  const getValue = (type: OsFilterType, field: OsField) => {
    const value = filters[field]?.value;

    if (type === "range") {
      const dateValue = value as OsRangeValue;
      return {
        from: dateValue.gte ? new Date(dateValue.gte) : undefined,
        to: dateValue.lte ? new Date(dateValue.lte) : undefined,
      };
    }

    return value as string[];
  };

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

  return {
    open,
    setOpen,
    onChange,
    getValue,
    accordionValues,
    setAccordionValues,
    filters,
    setFilters,
    onClose,
  };
};
