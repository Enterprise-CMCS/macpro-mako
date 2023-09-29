import { SearchForm } from "@/components";
import { FC } from "react";
import { useOsParams } from "../useOpensearch";
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
        data={() => getAllSearchData(params.state.filters)}
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
              console.log(data.cmsStatus, data.stateStatus);
              return user.data?.isCms ? data.cmsStatus : data.stateStatus;
            },
          },
        ]}
      />
      <OsExportButton />
      <OsFilterDrawer />
    </div>
  );
};
