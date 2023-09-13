import { Fragment, type FC, useCallback } from "react";
import {
  OsField,
  OsFilterValue,
  OsFilterable,
  OsRangeValue,
} from "shared-types";

import { Chip } from "@/components/Chip";
import { useOsQuery } from "@/components/Opensearch/useOpensearch";
import { useFilterDrawer } from "./useFilterDrawer";

interface RenderProps {
  filter: OsFilterable;
  index: number;
  openDrawer: () => void;
  updateField: (field: OsField) => (value: OsFilterValue) => void;
}

const renderMultipleValues: FC<RenderProps> = ({
  filter,
  index,
  openDrawer,
  updateField,
}) => {
  const update = updateField(filter.field);
  if (filter.value.constructor !== Array) return null;

  return (
    <Fragment key={`fragment-${filter.field}`}>
      {filter.value.map((val, valIndex, valArr) => {
        return (
          <Chip
            key={`${index}-${filter.field}-${val}-${valIndex}`}
            onChipClick={openDrawer}
            onIconClick={() => {
              valArr.splice(1, valIndex);
              update(valArr);
            }}
          >
            {`${filter?.label + ": " ?? ""}${val}`}
          </Chip>
        );
      })}
    </Fragment>
  );
};

const renderDateValue: FC<RenderProps> = ({
  filter,
  index,
  openDrawer,
  updateField,
}) => {
  const update = updateField(filter.field);
  const range = filter.value as OsRangeValue;
  return (
    <Chip
      key={`${index}-${filter.field}`}
      onChipClick={openDrawer}
      onIconClick={() => update({ gte: undefined, lte: undefined })}
    >
      {`${filter?.label + ": " ?? ""}${new Date(
        range?.gte ?? ""
      ).toLocaleDateString()} - ${new Date(
        range?.lte ?? ""
      ).toLocaleDateString()}`}
    </Chip>
  );
};

export const FilterChips: FC = () => {
  const {
    state: { filters },
  } = useOsQuery();
  const { onDrawerChange, onFilterChange, resetFilters } = useFilterDrawer();

  const openDrawer = useCallback(() => onDrawerChange(true), [onDrawerChange]);
  const multipleFilters =
    filters.length > 1 ||
    (Array.isArray(filters?.[0]?.value) && filters[0].value.length > 1);

  return (
    <div className="justify-start items-center py-2 flex flex-wrap gap-y-2 gap-x-2">
      {filters.map((filter, index) => {
        const compRender =
          filter.component === "dateRange"
            ? renderDateValue
            : renderMultipleValues;
        return compRender({
          filter,
          index,
          updateField: onFilterChange,
          openDrawer,
        });
      })}
      {multipleFilters && (
        <Chip
          variant={"function"}
          onChipClick={openDrawer}
          onIconClick={() => resetFilters()}
        >
          Clear All
        </Chip>
      )}
    </div>
  );
};
