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

export const OsFiltering: FC<{ disabled?: boolean }> = (props) => {
  const params = useOsParams();

  return (
    <div className="flex flex-row gap-2 border-[1px] border-slate-200">
      <SearchForm
        handleSearch={(search) =>
          params.onSet((s) => ({
            ...s,
            pagination: { ...s.pagination, number: 0 },
            search,
          }))
        }
        disabled={!!props.disabled}
      />
      <Sheet>
        <SheetTrigger>
          <div className="flex flex-row item-center border-slate-100 px-4">
            <Icon name="filter_list" />
            <Typography size="md">Filters</Typography>
          </div>
        </SheetTrigger>
        <SheetContent className="bg-white">
          <SheetHeader>
            <Typography size="lg">Filters</Typography>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};
