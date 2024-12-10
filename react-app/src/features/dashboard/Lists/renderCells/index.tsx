import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Authority, CognitoUserAttributes, opensearch } from "shared-types";
import { getAvailableActions, formatSeatoolDate } from "shared-utils";
import { Link } from "react-router-dom";
import * as POP from "@/components";
import { cn, DASHBOARD_ORIGIN, mapActionLabel, ORIGIN } from "@/utils";

export const renderCellDate = (key: keyof opensearch.main.Document) =>
  function Cell(data: opensearch.main.Document) {
    if (!data[key]) return null;
    return formatSeatoolDate(data[key] as string);
  };

type CellIdLinkProps = {
  id: string;
  authority: Authority | string;
};

export const CellDetailsLink = ({ id, authority }: CellIdLinkProps) => (
  <Link
    className="cursor-pointer text-blue-600"
    to={`/details/${encodeURIComponent(authority)}/${encodeURIComponent(id)}`}
  >
    {id}
  </Link>
);

export const renderCellActions = (user: CognitoUserAttributes | null) => {
  return function Cell(data: opensearch.main.Document) {
    if (!user) return null;

    const actions = getAvailableActions(user, data);
    return (
      <POP.Popover>
        <POP.PopoverTrigger
          disabled={!actions.length}
          className="block ml-3"
          aria-label="Available actions"
        >
          <EllipsisVerticalIcon
            aria-label="record actions"
            className={cn("w-8 ", actions.length ? "text-blue-700" : "text-gray-400")}
          />
        </POP.PopoverTrigger>
        <POP.PopoverContent>
          <div className="flex flex-col">
            {actions.map((action, idx) => (
              <Link
                state={{
                  from: `${location.pathname}${location.search}`,
                }}
                to={{
                  pathname: `/actions/${action}/${data.authority}/${data.id}`,
                  search: new URLSearchParams({
                    [ORIGIN]: DASHBOARD_ORIGIN,
                  }).toString(),
                }}
                key={`${idx}-${action}`}
                className={cn(
                  "text-blue-500",
                  "relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                )}
              >
                {mapActionLabel(action)}
              </Link>
            ))}
          </div>
        </POP.PopoverContent>
      </POP.Popover>
    );
  };
};
