import { SearchForm } from "@/components";
import { FC } from "react";
import { DEFAULT_FILTERS, useOsParams } from "../useOpensearch";
import { NewExportButton, OsExportButton } from "@/components/ExportButton";
import { useOsContext } from "../Provider";
import { OsFilterDrawer } from "./FilterDrawer";
import { getAllSearchData } from "@/api";
import { isCmsUser } from "shared-utils";
import { useGetUser } from "@/api/useGetUser";

export const OsFiltering: FC<{ disabled?: boolean }> = (props) => {
  const params = useOsParams();
  const context = useOsContext();
  const user = useGetUser();
  const filters = DEFAULT_FILTERS[params.state.tab]?.filters ?? [];

  return (
    <div className="flex flex-row gap-2 border-[1px] border-slate-200">
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
      <NewExportButton
        data={() => getAllSearchData([...params.state.filters, ...filters])}
        headers={[
          {
            name: "SPA ID",
            transform: (data) => data.id,
          },
          {
            name: "State",
            transform: (data) => data.state,
          },
          {
            name: "Type",
            transform: (data) => data?.actionType ?? "",
          },
          {
            name: "Status",
            transform(data) {
              return user.data?.isCms ? data.cmsStatus : data.stateStatus;
            },
          },
          {
            name: "Initial Submission",
            transform: (data) => data?.submissionDate ?? "",
          },
          {
            // TODO: Get more info on what property Formal Rai Response should be???
            name: "Formal RAI Response",
            transform: (data) => data.raiRequestedDate ?? "",
          },
          {
            name: "CPOC Name",
            transform: (data) => data.leadAnalystName ?? "",
          },
          {
            name: "Submitted By",
            transform: (data) => data.submitterName ?? "",
          },
        ]}
      />
      <OsExportButton />
      <OsFilterDrawer />
    </div>
  );
};
