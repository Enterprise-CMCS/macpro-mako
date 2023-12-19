import * as POP from "@/components/Popover";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { CognitoUserAttributes, OsMainSourceItem } from "shared-types";
import { packageActionsForResult } from "shared-utils";
import { Link } from "react-router-dom";
import { cn } from "@/lib";
import { mapActionLabel } from "@/utils";
import { format } from "date-fns";

export const renderCellDate = (key: keyof OsMainSourceItem) =>
  function Cell(data: OsMainSourceItem) {
    if (!data[key]) return null;
    return format(new Date(data[key] as string), "MM/dd/yyyy");
  };

export const renderCellIdLink = (pathResolver: (id: string) => string) =>
  function Cell(data: OsMainSourceItem) {
    if (!data.authority) return <></>;
    const path = pathResolver(encodeURIComponent(data.id));
    return (
      <Link className="cursor-pointer text-blue-600" to={path}>
        {data.id}
      </Link>
    );
  };

export const renderCellActions = (user: CognitoUserAttributes | null) =>
  function Cell(data: OsMainSourceItem) {
    if (!user) return <></>;
    const actions = packageActionsForResult(user, data);
    return (
      <>
        <POP.Popover>
          <POP.PopoverTrigger disabled={!actions.length} className="block ml-3">
            <EllipsisVerticalIcon
              className={cn(
                "w-8 ",
                actions.length ? "text-blue-700" : "text-gray-400"
              )}
            />
          </POP.PopoverTrigger>
          <POP.PopoverContent>
            <div className="flex flex-col">
              {actions.map((action, idx) => {
                return (
                  <Link
                    className={cn(
                      "text-blue-500",
                      "relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    )}
                    to={`/action/${data.id}/${action}`}
                    key={`${idx}-${action}`}
                  >
                    {mapActionLabel(action)}
                  </Link>
                );
              })}
            </div>
          </POP.PopoverContent>
        </POP.Popover>
      </>
    );
  };
