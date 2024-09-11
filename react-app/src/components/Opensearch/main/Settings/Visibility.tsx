import { cn } from "@/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as UI from "@/components";

// type Item = { label: string; field?: string; hidden: boolean };

type Props<T extends UI.OsTableColumn> = {
  list: T[];
  onItemClick: (field: string) => void;
  hiddenColumns: T[];
};

export const VisibilityPopover = ({
  list,
  onItemClick,
  hiddenColumns,
}: Props<UI.OsTableColumn>) => {
  return (
    <UI.Popover>
      <UI.PopoverTrigger asChild>
        <UI.Button
          variant="outline"
          className="w-full xs:w-fit min-w-0 whitespace-nowrap hover:bg-transparent self-center h-10 flex gap-2"
        >
          <span className="prose-sm">
            {hiddenColumns.length
              ? `Columns (${hiddenColumns.length} hidden)`
              : "Columns"}
          </span>
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent className="bg-white">
        <div className="flex flex-col gap-2">
          <VisibilityMenu
            list={list}
            onItemClick={onItemClick}
            hiddenColumns={hiddenColumns}
          />
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};

export const VisiblityItem = <T extends UI.OsTableColumn>(
  props: T & { onClick: () => void },
) => {
  const eyeStyles = cn("flex flex-row gap-2 cursor-pointer", {
    "text-gray-800": !props.hidden,
    "text-gray-400": props.hidden,
  });

  return (
    <div
      className={cn("flex flex-row gap-2 cursor-pointer", {
        "text-gray-800": !props.hidden,
        "text-gray-400": props.hidden,
      })}
      onClick={props.onClick}
    >
      {props.hidden && <EyeOffIcon className={eyeStyles} />}
      {!props.hidden && <EyeIcon className={eyeStyles} />}
      <div className="mt-[-1px] prose-base">{props.label}</div>
    </div>
  );
};

export const VisibilityMenu = <T extends UI.OsTableColumn>(props: Props<T>) => {
  return (
    <div className="flex flex-col gap-2">
      {props.list.map((IT) => {
        if (!IT.field) return null;
        return (
          <VisiblityItem
            key={`vis-${IT.field}`}
            onClick={() => props.onItemClick(IT.field as string)}
            {...IT}
          />
        );
      })}
    </div>
  );
};
