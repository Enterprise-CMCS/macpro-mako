import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/Sheet";
import { SearchForm } from "@/components";
import { FC } from "react";
import { Icon, Typography } from "@enterprise-cmcs/macpro-ux-lib";
import { useOsParams } from "../useOpensearch";
import { OsExportButton } from "@/components/ExportButton";
import { useOsContext } from "../Provider";

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
      <Sheet>
        <SheetTrigger>
          <div className="tw-flex tw-flex-row tw-item-center tw-border-slate-100 tw-px-4">
            <Icon name="filter_list" />
            <Typography size="md">Filters</Typography>
          </div>
        </SheetTrigger>
        <SheetContent className="tw-bg-white">
          <SheetHeader>
            <Typography size="lg">Filters</Typography>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};
