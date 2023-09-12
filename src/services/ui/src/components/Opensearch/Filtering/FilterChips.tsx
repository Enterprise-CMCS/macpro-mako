import { type FC } from "react";

import { useOsQuery } from "@/components/Opensearch/useOpensearch";
import { Chip } from "@/components/Chip";

export const FilterChips: FC = () => {
  const {
    state: { filters },
  } = useOsQuery();

  return (
    <div className="justify-start items-center py-2 flex">
      {filters.map((filter, index) => {
        return (
          <Chip className="mr-2" key={`${index}-${filter.field}`}>
            {"test" + index}
          </Chip>
        );
      })}
      {filters.length > 1 && <Chip variant={"function"}>Clear All</Chip>}
    </div>
  );
};
