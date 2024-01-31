import { SearchForm } from "@/components";
import { FC } from "react";
import { useOsUrl } from "../useOpensearch";
import { useOsContext } from "../Provider";
import { OsFilterDrawer } from "./Drawer";
import { OsFilterExport } from "./Export";

export const OsFiltering: FC<{
  disabled?: boolean;
}> = (props) => {
  const url = useOsUrl();
  const context = useOsContext();

  return (
    <div>
      <p className="mb-1 text-sm">
        {"Search by Package ID, CPOC Name, or Submitter Name"}
      </p>
      <div className="flex flex-row content-between gap-2 mb-4">
        <SearchForm
          isSearching={context.isLoading}
          handleSearch={(search) =>
            url.onSet((s) => ({
              ...s,
              pagination: { ...s.pagination, number: 0 },
              search,
            }))
          }
          disabled={!!props.disabled}
        />
        <div className="flex flex-row gap-2">
          <OsFilterExport />
          <OsFilterDrawer />
        </div>
      </div>
    </div>
  );
};

export * from "./Chipbar";
export * from "./FilterProvider";
