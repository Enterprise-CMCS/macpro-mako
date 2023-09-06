import { cn } from "@/lib/utils";
import { Icon, Typography } from "@enterprise-cmcs/macpro-ux-lib";
import * as UI from "@/components/Popover";

type Item = { label: string; field: string; hidden: boolean };

type Props<T extends Item> = {
  list: T[];
  onItemClick: (field: string) => void;
};

export const VisibilityPopover = <T extends Item>(props: Props<T>) => {
  return (
    <UI.Popover>
      <UI.PopoverTrigger>
      <div className="sr-only">Open Filters</div>
        <Icon name="visibility" />
      </UI.PopoverTrigger>
      <UI.PopoverContent className="bg-white">
        <div className="flex flex-col gap-2">
          <VisibilityMenu {...props} />
        </div>
      </UI.PopoverContent>
    </UI.Popover>
  );
};

export const VisiblityItem = <T extends Item>(
  props: T & { onClick: () => void }
) => {
  return (
    <div
      className={cn("flex flex-row gap-2 cursor-pointer", {
        "text-gray-800": !props.hidden,
        "text-gray-400": props.hidden,
      })}
      onClick={props.onClick}
    >
      <Icon
        name={!props.hidden ? "visibility" : "visibility_off"}
        className={cn({
          "text-gray-800": !props.hidden,
          "text-gray-400": props.hidden,
        })}
      />
      <Typography size="md" className="mt-[-1px]">
        {props.label}
      </Typography>
    </div>
  );
};

export const VisibilityMenu = <T extends Item>(props: Props<T>) => {
  return (
    <div className="flex flex-col gap-2">
      {props.list.map((IT) => (
        <VisiblityItem
          key={`vis-${IT.field}`}
          onClick={() => props.onItemClick(IT.field)}
          {...IT}
        />
      ))}
    </div>
  );
};
