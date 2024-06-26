import { OsTableColumn, SearchForm } from "@/components";
import { FC } from "react";
import { useOsUrl } from "../useOpensearch";
import { useOsContext } from "../Provider";
import { OsFilterDrawer } from "./Drawer";
import { OsExportData } from "./Export";

export const OsFiltering: FC<{
  columns: OsTableColumn[];
  disabled?: boolean;
}> = (props) => {
  const url = useOsUrl();
  const context = useOsContext();

  return (
    <div className="w-full my-2 max-w-screen-xl self-center">
      <p className="mb-1 text-sm">
        {"Search by Package ID, CPOC Name, or Submitter Name"}
      </p>
      <div className="flex w-full md:flex-row flex-col flex-grow content-between gap-2 mb-4">
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
        <div className="flex justify-center flex-row gap-2">
          <OsExportData columns={props.columns} />
          <OsFilterDrawer />
        </div>
      </div>
    </div>
  );
};

export * from "./Chipbar";
export * from "./FilterProvider";
export * from "./Export";
