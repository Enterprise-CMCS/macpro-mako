import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router";
import { Authority, FullUser, opensearch } from "shared-types";
import { formatDateToET, getAvailableActions } from "shared-utils";

import { DASHBOARD_ORIGIN, mapActionLabel, ORIGIN } from "@/utils";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export const renderCellDate = (key: keyof opensearch.main.Document) =>
  function Cell(data: opensearch.main.Document) {
    if (!data[key]) return null;
    return formatDateToET(data[key] as string, "MM/dd/yyyy", false);
  };

export type CellIdLinkProps = {
  id: string;
  authority: Authority | string;
};

export const CellDetailsLink = ({ id, authority }: CellIdLinkProps) => {
  const handleLinkClick = () => {sendGAEvent("dash_package_link", {
        package_type: authority, // The 'authority' prop is the package type
        package_id: id, // The 'id' prop is the package_id
      });
  };

  return (
    <Link
      className="cursor-pointer text-blue-600 hover:underline"
      to={`/details/${encodeURIComponent(authority)}/${encodeURIComponent(id)}`}
      onClick={handleLinkClick} // Track the click event for analytics
    >
      {id}
    </Link>
  );
};

export const renderCellActions = (user: FullUser | null) => {
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
          <button className="group ml-3" type="button" title="Expand Available Package Actions">
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
          {actions.map((action, idx) => {
            const handleActionClick = () => {
              sendGAEvent("dash_ellipsis_click", {
                  action: action,
                });
            };

            return (
              <DropdownMenu.Item
                key={`${idx}-${action}`}
                asChild
                aria-label={`${mapActionLabel(action)} for ${data.id}`}
              >
                <Link
                  onClick={handleActionClick}
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
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  };
};
