import { SearchForm } from "@/components";
import { FC } from "react";
import { DEFAULT_FILTERS, useOsParams } from "../useOpensearch";
import { ExportButton } from "@/components/ExportButton";
import { useOsContext } from "../Provider";
import { OsFilterDrawer } from "./FilterDrawer";
import { getAllSearchData } from "@/api";
import { useGetUser } from "@/api/useGetUser";
import { EXPORT_GROUPS } from "./consts";

export const OsFiltering: FC<{
  disabled?: boolean;
}> = (props) => {
  const params = useOsParams();
  const context = useOsContext();
  const user = useGetUser();
  const filters = DEFAULT_FILTERS[params.state.tab]?.filters ?? [];

  return (
    <div>
      <p className="mb-1 text-sm text-slate-400">
        {"Search by Package ID, CPOC Name, or Submitter Name"}
      </p>
      <div className="flex flex-row content-between gap-2 mb-4">
        <SearchForm
          isSearching={context.isLoading}
          handleSearch={(search) =>
            params.onSet((s) => ({
              ...s,
              pagination: { ...s.pagination, number: 0 },
              search,
            }))
          }
          disabled={!!props.disabled}
        />
        <div className="flex flex-row gap-2">
          <ExportButton
            data={() => getAllSearchData([...params.state.filters, ...filters])}
            headers={EXPORT_GROUPS(params.state.tab, user)}
          />
          <OsFilterDrawer />
        </div>
      </div>
    </div>
  );
};

export * from "./FilterChips";
export * from "./FilterProvider";
