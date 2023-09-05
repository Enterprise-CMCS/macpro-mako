import { SearchForm } from "@/components";
import { FC } from "react";
import { useOsParams } from "../useOpensearch";
import { OsExportButton } from "@/components/ExportButton";
import { useOsContext } from "../Provider";
import { OsFilterDrawer } from "./FilterDrawer";

export const OsFiltering: FC<{ disabled?: boolean }> = (props) => {
  const params = useOsParams();
  const context = useOsContext();

  return (
    <div className="tw-flex tw-flex-row tw-gap-2 tw-border-[1px] tw-border-slate-200">
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
      <OsExportButton />
      <OsFilterDrawer />
    </div>
  );
};
