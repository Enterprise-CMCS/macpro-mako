import { type FC, useCallback, Fragment } from "react";

import { Chip } from "@/components/Chip";
import { useOsParams } from "@/components/Opensearch/useOpensearch";
import { OsFilterable, OsRangeValue } from "shared-types";
import { useFilterDrawerContext } from "./FilterProvider";

interface RenderProp {
  filter: OsFilterable;
  index: number;
  openDrawer: () => void;
  clearFilter: (filter: OsFilterable, valIndex?: number) => void;
}

const checkMultiFilter = (filters: OsFilterable[]) => {
  return (
    filters.length > 1 ||
    filters.some(
      (filter) => Array.isArray(filter.value) && filter.value.length > 1
    )
  );
};

// render function for simple date range chips
const renderDateChip: FC<RenderProp> = ({
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
      ).toLocaleDateString()}}`}
    </Chip>
  );
};

// render function for array value chips
const renderChipList: FC<RenderProp> = ({
  filter,
  index,
  clearFilter,
  openDrawer,
}) => {
  if (!Array.isArray(filter.value)) return null;

  return (
    <Fragment key={`${index}-${filter.field}-fragment`}>
      {filter.value.map((v, vindex) => {
        return (
          <Chip
            key={`${index}-${vindex}-${filter.field}`}
            onChipClick={openDrawer}
            onIconClick={() => {
              clearFilter(filter, vindex);
            }}
          >{`${filter?.label + ": " ?? ""}${v}`}</Chip>
        );
      })}
    </Fragment>
  );
};

export const FilterChips: FC = () => {
  const params = useOsParams();
  const { setDrawerState } = useFilterDrawerContext();

  const openDrawer = useCallback(() => setDrawerState(true), [setDrawerState]);
  const multipleFilters = checkMultiFilter(params.state.filters);
  const clearFilter = (filter: OsFilterable, valIndex?: number) => {
    params.onSet((s) => {
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
  const resetFilters = () => {
    params.onSet((s) => ({
      ...s,
      filters: [],
      pagination: { ...s.pagination, number: 0 },
    }));
  };

  return (
    <div className="justify-start items-center py-2 flex flex-wrap gap-y-2 gap-x-2">
      {params.state.filters.map((filter, index) => {
        const props: RenderProp = { clearFilter, openDrawer, filter, index };
        if (filter.type === "range") return renderDateChip(props);
        if (filter.type === "terms") return renderChipList(props);
        return null;
      })}
      {multipleFilters && (
        <Chip variant={"destructive"} onChipClick={resetFilters}>
          Clear All
        </Chip>
      )}
    </div>
  );
};
