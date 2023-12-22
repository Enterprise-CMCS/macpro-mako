import { type FC, useCallback, Fragment } from "react";

import { Chip } from "@/components/Chip";
import { useOsUrl } from "@/components/Opensearch";
import { OsFilterable, OsRangeValue } from "shared-types";
import { useFilterDrawerContext } from "./FilterProvider";
import { checkMultiFilter, resetFilters } from "../utils";
import { useLabelMapping } from "@/hooks";

interface RenderProp {
  filter: OsFilterable;
  index: number;
  openDrawer: () => void;
  clearFilter: (filter: OsFilterable, valIndex?: number) => void;
}

// simple date range chips
const DateChip: FC<RenderProp> = ({
  filter,
  index,
  openDrawer,
  clearFilter,
}) => {
  const value = filter.value as OsRangeValue;
  return (
    <Chip
      key={`${index}-${filter.field}`}
      onChipClick={openDrawer}
      onIconClick={() => {
        clearFilter(filter);
      }}
    >
      {`${filter?.label}: ${new Date(
        value.gte || ""
      ).toLocaleDateString()} - ${new Date(
        value.lte || ""
      ).toLocaleDateString()}`}
    </Chip>
  );
};

// array value chips
const ChipList: FC<RenderProp> = ({
  filter,
  index,
  clearFilter,
  openDrawer,
}) => {
  const labelMap = useLabelMapping();

  if (!Array.isArray(filter.value)) return null;

  return (
    <Fragment key={`${index}-${filter.field}-fragment`}>
      {filter.value.map((v, vindex) => {
        const chipText = `${filter?.label + ": " ?? ""}${labelMap[v] ?? v}`;
        return (
          <Chip
            key={`${index}-${vindex}-${filter.field}`}
            onChipClick={openDrawer}
            onIconClick={() => {
              clearFilter(filter, vindex);
            }}
          >
            {chipText}
          </Chip>
        );
      })}
    </Fragment>
  );
};

export const FilterChips: FC = () => {
  const url = useOsUrl();
  const { setDrawerState } = useFilterDrawerContext();

  const openDrawer = useCallback(() => setDrawerState(true), [setDrawerState]);
  const twoOrMoreFiltersApplied = checkMultiFilter(url.state.filters, 2);
  const clearFilter = (filter: OsFilterable, valIndex?: number) => {
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

  const handleChipClick = () => resetFilters(url.onSet);

  return (
    <div className="justify-start items-center py-2 flex flex-wrap gap-y-2 gap-x-2">
      {url.state.filters.map((filter, index) => {
        const props: RenderProp = { clearFilter, openDrawer, filter, index };
        if (filter.type === "range") return <DateChip {...props} />;
        if (filter.type === "terms") return <ChipList {...props} />;
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
