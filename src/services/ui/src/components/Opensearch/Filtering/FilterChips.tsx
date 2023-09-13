import { Fragment, type FC } from "react";

import { useOsQuery } from "@/components/Opensearch/useOpensearch";
import { Chip } from "@/components/Chip";
import { OsFilterable, OsRangeValue } from "shared-types";

interface RenderProps {
  filter: OsFilterable;
  index: number;
}

const renderMultipleValues: FC<RenderProps> = ({ filter, index }) => {
  if (filter.value.constructor !== Array) return <></>;

  return (
    <Fragment key={`fragment-${filter.field}`}>
      {filter.value.map((val, valIndex) => {
        return (
          <Chip key={`${index}-${filter.field}-${val}-${valIndex}`}>
            {`${filter?.label + ": " ?? ""}${val}`}
          </Chip>
        );
      })}
    </Fragment>
  );
};

const renderDateValue: FC<RenderProps> = ({ filter, index }) => {
  const range = filter.value as OsRangeValue;
  return (
    <Chip key={`${index}-${filter.field}`}>
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
  const multipleFilters =
    filters.length > 1 ||
    (Array.isArray(filters[0].value) && filters[0].value.length > 1);

  return (
    <div className="justify-start items-center py-2 flex flex-wrap gap-y-2 gap-x-2">
      {filters.map((filter, index) => {
        const compRender =
          filter.component === "dateRange"
            ? renderDateValue
            : renderMultipleValues;
        return compRender({ filter, index });
      })}
      {multipleFilters && <Chip variant={"function"}>Clear All</Chip>}
    </div>
  );
};
