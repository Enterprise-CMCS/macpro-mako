import { type FC, useCallback } from "react";

import { Chip } from "@/components/Chip";
import { useOsParams } from "@/components/Opensearch/useOpensearch";
import { OsRangeValue } from "shared-types";
import { useFilterDrawerContext } from "./FilterProvider";

export const FilterChips: FC = () => {
  const params = useOsParams();
  const { setDrawerState } = useFilterDrawerContext();

  const openDrawer = useCallback(() => setDrawerState(true), [setDrawerState]);
  const multipleFilters = !!params.state.filters.length;
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
        return (
          <Chip
            key={`${index}-${filter.field}`}
            onChipClick={openDrawer}
            onIconClick={() =>
              params.onSet((s) => ({
                ...s,
                filters: s.filters.filter((FIL) => FIL.field !== filter.field),
              }))
            }
          >
            {(() => {
              if (filter.type === "terms") {
                const value = filter.value as string[];
                return `${filter?.label + ": " ?? ""}${value}`;
              }

              if (filter.type === "range") {
                const value = filter.value as OsRangeValue;
                return `${filter?.label}: ${new Date(
                  value.gte || ""
                ).toLocaleDateString()} - ${new Date(
                  value.lte || ""
                ).toLocaleDateString()}`;
              }

              return "";
            })()}
          </Chip>
        );
      })}
      {multipleFilters && (
        <Chip variant={"destructive"} onChipClick={resetFilters}>
          Clear All
        </Chip>
      )}
    </div>
  );
};
