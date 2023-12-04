import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
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
        <EyeIcon className="w-6 h-6" />
        <p className="sr-only">Visibility Popover Icon</p>
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
