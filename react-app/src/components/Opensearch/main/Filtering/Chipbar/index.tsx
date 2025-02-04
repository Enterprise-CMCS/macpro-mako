import { type FC, useCallback } from "react";

import { Chip, useOsUrl, checkMultiFilter } from "@/components";
import { opensearch } from "shared-types";
import { useFilterDrawerContext } from "../FilterProvider";
import { useLabelMapping } from "@/hooks";
import { UTCDate } from "@date-fns/utc";
import { format } from "date-fns";

export const DATE_FORMAT = "M/d/yyyy";
export interface RenderProp {
  filter: opensearch.main.Filterable;
  index: number;
  openDrawer: () => void;
  clearFilter: (filter: opensearch.main.Filterable, valIndex?: number) => void;
}

export const ChipBool: FC<RenderProp> = ({ filter, openDrawer, clearFilter }) => {
  const value = filter.value as opensearch.FilterValue;
  return (
    <Chip
      onChipClick={openDrawer}
      onIconClick={() => {
        clearFilter(filter);
      }}
    >
      {filter?.label ? `${filter.label}: ` : ""}
      <strong>{value ? "Yes" : "No"}</strong>
    </Chip>
  );
};

export const ChipDate: FC<RenderProp> = ({ filter, openDrawer, clearFilter }) => {
  const value = filter.value as opensearch.RangeValue;
  if (!value?.gte && !value?.lte) return null;
  const label = filter?.label ? `${filter.label}: ` : "";
  const gte = format(new UTCDate(value?.gte || value?.lte), DATE_FORMAT);
  const lte = format(new UTCDate(value?.lte || value?.gte), DATE_FORMAT);
  const range = `${gte} - ${lte}`;
  return (
    <Chip
      onChipClick={openDrawer}
      onIconClick={() => {
        clearFilter(filter);
      }}
    >
      {`${label}${range}`}
    </Chip>
  );
};

export const ChipTerms: FC<RenderProp> = ({ filter, clearFilter, openDrawer }) => {
  const labelMap = useLabelMapping();

  if (!Array.isArray(filter.value)) return null;

  return (
    <>
      {filter.value.map((v, vindex) => {
        const chipText = `${filter?.label ? `${filter.label}: ` : ""}${labelMap[v] ?? v}`;
        return (
          <Chip
            key={`${vindex}-${filter.field}`}
            onChipClick={openDrawer}
            onIconClick={() => {
              clearFilter(filter, vindex);
            }}
          >
            {chipText}
          </Chip>
        );
      })}
    </>
  );
};

export const FilterChips: FC = () => {
  const url = useOsUrl();
  const { setDrawerState } = useFilterDrawerContext();

  const openDrawer = useCallback(() => setDrawerState(true), [setDrawerState]);
  const twoOrMoreFiltersApplied = checkMultiFilter(url.state.filters, 2);
  const clearFilter = (filter: opensearch.main.Filterable, valIndex?: number) => {
    url.onSet((s) => {
      let filters = s.filters;
      const filterIndex = filters.findIndex((f) => f.field === filter.field);

      if (
        Array.isArray(filters[filterIndex].value) &&
        (filters[filterIndex].value as unknown[]).length > 1
      ) {
        (filters[filterIndex].value as unknown[]).splice(valIndex ?? 0, 1);
      } else {
        filters = filters.filter((f) => f.field !== filter.field);
      }

      return {
        ...s,
        filters: filters,
        pagination: { ...s.pagination, number: 0 },
      };
    });
  };

  const handleChipClick = () =>
    url.onSet((s) => ({
      ...s,
      filters: [],
      pagination: { ...s.pagination, number: 0 },
    }));

  return (
    <div
      className="justify-start items-center py-2 flex flex-wrap gap-y-2 gap-x-2"
      data-testid="chips"
    >
      {url.state.filters.map((filter, index) => {
        const props: RenderProp = { clearFilter, openDrawer, filter, index };
        const key = `${filter.field}-${index}`;

        if (filter.type === "range") return <ChipDate key={key} {...props} />;
        if (filter.type === "terms") return <ChipTerms key={key} {...props} />;
        if (filter.type === "match") return <ChipBool key={key} {...props} />;

        return null;
      })}
      {twoOrMoreFiltersApplied && (
        <Chip variant={"destructive"} onChipClick={handleChipClick}>
          Clear All
        </Chip>
      )}
    </div>
  );
};
