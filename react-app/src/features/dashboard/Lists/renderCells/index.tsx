import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router";
import { Authority, CognitoUserAttributes, opensearch } from "shared-types";
import { formatSeatoolDate, getAvailableActions } from "shared-utils";

import { DASHBOARD_ORIGIN, mapActionLabel, ORIGIN } from "@/utils";

export const renderCellDate = (key: keyof opensearch.main.Document) =>
  function Cell(data: opensearch.main.Document) {
    if (!data[key]) return null;
    return formatSeatoolDate(data[key] as string);
  };

export type CellIdLinkProps = {
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
      <DropdownMenu.Root>
        <DropdownMenu.DropdownMenuTrigger
          disabled={!actions.length}
          aria-label="Available package actions"
          data-testid="available-actions"
          asChild
        >
          <button className="group ml-3" type="button">
            <EllipsisVerticalIcon
              aria-hidden
              className="w-8 text-blue-700 group-disabled:text-gray-500"
            />
          </button>
        </DropdownMenu.DropdownMenuTrigger>
        <DropdownMenu.Content
          className="flex flex-col bg-white rounded-md shadow-lg p-4 border"
          align="start"
        >
          {actions.map((action, idx) => (
            <DropdownMenu.Item
              key={`${idx}-${action}`}
              asChild
              aria-label={`${mapActionLabel(action)} for ${data.id}`}
            >
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
                className="text-blue-500 flex select-none items-center rounded-sm px-2 py-2 text-sm hover:bg-accent"
              >
                {mapActionLabel(action)}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  };
};
