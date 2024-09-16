import { OsTableColumn, SearchForm } from "@/components";
import { FC } from "react";
import { useOsUrl } from "../useOpensearch";
import { useOsContext } from "../Provider";
import { OsFilterDrawer } from "./Drawer";
import { OsExportData } from "./Export";
import { VisibilityPopover } from "@/components";
export const OsFiltering: FC<{
  columns: OsTableColumn[];
  onToggle: (field: string) => void;
  disabled?: boolean;
}> = ({ columns, onToggle, disabled }) => {
  const url = useOsUrl();
  const context = useOsContext();

  return (
    <div>
    {/* <div className="w-full my-2 max-w-screen-xl self-center px-4 lg:px-8"> */}
      <p className="mb-1 text-sm">
        {"Search by Package ID, CPOC Name, or Submitter Name"}
      </p>
      <div className="flex w-full lg:flex-row flex-col flex-grow content-between gap-2 mb-4">
        <SearchForm
          isSearching={context.isLoading}
          handleSearch={(search) =>
            url.onSet((s) => ({
              ...s,
              pagination: { ...s.pagination, number: 0 },
              search,
            }))
          }
          disabled={!!disabled}
        />
        <div className="flex flex-wrap justify-center gap-2 max-w-full">
          <VisibilityPopover
            list={columns.filter((COL) => COL.locked === false || COL.field)}
            onItemClick={onToggle}
            hiddenColumns={columns.filter((COL) => COL.hidden === true)}
          />
          <OsFilterDrawer />
          <OsExportData columns={columns} disabled={context?.data?.total.value === 0}/>
        </div>
      </div>
    </div>
  );
};

export * from "./Chipbar";
export * from "./FilterProvider";
export * from "./Export";
