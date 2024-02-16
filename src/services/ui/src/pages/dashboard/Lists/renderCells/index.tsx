import * as POP from "@/components/Popover";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { CognitoUserAttributes, opensearch } from "shared-types";
import { getAvailableActions } from "shared-utils";
import { cn } from "@/lib";
import { mapActionLabel } from "@/utils";
import { formatSeatoolDate } from "shared-utils";
import { Link as TypedLink } from "@/components/Routing";
import { Link } from "react-router-dom";

export const renderCellDate = (key: keyof opensearch.main.Document) =>
  function Cell(data: opensearch.main.Document) {
    if (!data[key]) return null;
    return formatSeatoolDate(data[key] as string);
  };

export const renderCellIdLink = (pathResolver: (id: string) => string) =>
  function Cell(data: opensearch.main.Document) {
    if (!data.authority) return <></>;
    const path = pathResolver(encodeURIComponent(data.id));
    return (
      <Link className="cursor-pointer text-blue-600" to={path}>
        {data.id}
      </Link>
    );
  };

export const renderCellActions = (user: CognitoUserAttributes | null) =>
  function Cell(data: opensearch.main.Document) {
    if (!user) return <></>;
    const actions = getAvailableActions(user, data);
    return (
      <>
        <POP.Popover>
          <POP.PopoverTrigger
            disabled={!actions.length}
            className="block ml-3"
            aria-label="Available actions"
          >
            <EllipsisVerticalIcon
              aria-label="record actions"
              className={cn(
                "w-8 ",
                actions.length ? "text-blue-700" : "text-gray-400"
              )}
            />
          </POP.PopoverTrigger>
          <POP.PopoverContent>
            <div className="flex flex-col">
              {actions.map((action, idx) => {
                if (data.authority === "WAIVER") {
                  return (
                    <TypedLink
                      path="/action/waiver/:id/:type"
                      key={`${idx}-${action}`}
                      params={{ id: data.id, type: action }}
                      className={cn(
                        "text-blue-500",
                        "relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}
                    >
                      {/* /action/waiver/someid/sometype */}
                      {mapActionLabel(action)}
                    </TypedLink>
                  );
                }
                return (
                  <Link
                    className={cn(
                      "text-blue-500",
                      "relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    )}
                    to={`/action/${data.id}/${action}?origin=actionsDashboard`}
                    key={`${idx}-${action}`}
                    aria-label={action}
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
