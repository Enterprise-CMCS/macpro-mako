import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import * as UI from "@/components";
import { cn } from "@/utils";

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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <UI.Button
          variant="outline"
          className="w-full xs:w-fit whitespace-nowrap hover:bg-transparent self-center h-10 flex gap-2"
          data-testid="columns-menu-btn"
        >
          <span className="prose-sm">
            {hiddenColumns.length ? `Columns (${hiddenColumns.length} hidden)` : "Columns"}
          </span>
        </UI.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <VisibilityMenu list={list} onItemClick={onItemClick} hiddenColumns={hiddenColumns} />
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const VisiblityItem = <T extends UI.OsTableColumn>(props: T & { onClick: () => void }) => {
  const eyeStyles = cn("flex gap-2", {
    "text-gray-800": !props.hidden,
    "text-gray-500": props.hidden,
  });

  return (
    <li
      aria-live="assertive"
      aria-atomic="true"
      aria-label={`${props.label}, toggle visibility, currently ${props.hidden ? "hidden" : "visible"}`}
    >
      <DropdownMenu.Item
        asChild
        onSelect={(e) => {
          e.preventDefault(); // necessary to prevent closing the menu when selecting an item
          props.onClick();
        }}
      >
        <button
          className={cn("flex items-center gap-2 w-full", {
            "text-gray-800": !props.hidden,
            "text-gray-500": props.hidden,
          })}
          type="button"
        >
          {props.hidden ? (
            <EyeOffIcon className={eyeStyles} aria-hidden focusable={false} />
          ) : (
            <EyeIcon className={eyeStyles} aria-hidden focusable={false} />
          )}
          <span aria-hidden>{props.label}</span>
        </button>
      </DropdownMenu.Item>
    </li>
  );
};

export const VisibilityMenu = <T extends UI.OsTableColumn>(props: Props<T>) => (
  <DropdownMenu.Content asChild>
    <ul
      className="flex flex-col gap-2 bg-white p-4 shadow-md rounded-md w-72"
      data-testid="columns-menu"
    >
      {props.list.map((IT) =>
        IT.field ? (
          <VisiblityItem
            key={`vis-${IT.field}`}
            onClick={() => props.onItemClick(IT.field as string)}
            {...IT}
          />
        ) : null,
      )}
    </ul>
  </DropdownMenu.Content>
);
