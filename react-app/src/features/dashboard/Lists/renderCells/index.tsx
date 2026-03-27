import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router";
import { FullUser, opensearch, SEATOOL_STATUS } from "shared-types";
import { formatDateToET, getAvailableActions, isStateUser } from "shared-utils";

import { deleteDraft } from "@/api/deleteDraft";
import { banner, userPrompt } from "@/components";
import { DASHBOARD_ORIGIN, mapActionLabel, ORIGIN, queryClient } from "@/utils";
import {
  DRAFT_CONTINUE_ACTION_LABEL,
  DRAFT_DELETE_ACTION_LABEL,
  DRAFT_DELETE_MODAL_BODY,
  DRAFT_DELETE_MODAL_HEADER,
  getDraftEditLink,
  getNonOwnerDraftDeleteModalBody,
} from "@/utils/drafts";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export const renderCellDate = (key: keyof opensearch.main.Document) =>
  function Cell(data: opensearch.main.Document) {
    if (!data[key]) return null;
    return formatDateToET(data[key] as string, "MM/dd/yyyy", false);
  };

export type CellIdLinkProps = {
  record: opensearch.main.Document;
};

export const CellDetailsLink = ({ record }: CellIdLinkProps) => {
  const { id, authority } = record;
  const isDraft = record.seatoolStatus === SEATOOL_STATUS.DRAFT;
  const handleLinkClick = () => {
    sendGAEvent("dash_package_link", {
      package_type: authority, // The 'authority' prop is the package type
      package_id: id, // The 'id' prop is the package_id
    });
  };

  const detailsLink = `/details/${encodeURIComponent(authority)}/${encodeURIComponent(id)}`;
  const detailsSearch = isDraft ? "?preferDraft=true" : "";

  return (
    <Link
      className={`cursor-pointer text-blue-600 hover:underline ${isDraft ? "italic" : ""}`}
      to={`${detailsLink}${detailsSearch}`}
      onClick={handleLinkClick} // Track the click event for analytics
    >
      {id}
    </Link>
  );
};

export const renderCellActions = (user: FullUser | null) => {
  return function Cell(data: opensearch.main.Document) {
    if (!user) return null;

    const draftLink = getDraftEditLink(data);
    return <ActionMenuCell data={data} draftLink={draftLink} user={user} />;
  };
};

const ActionMenuCell = ({
  data,
  draftLink,
  user,
}: {
  data: opensearch.main.Document;
  draftLink: ReturnType<typeof getDraftEditLink>;
  user: FullUser;
}) => {
  const hasDraftActions =
    data.seatoolStatus === SEATOOL_STATUS.DRAFT && isStateUser(user) && !!draftLink;
  const actions = hasDraftActions ? [] : getAvailableActions(user, data);
  const draftOwnerEmail = data.draft?.draftOwnerEmail ?? data.submitterEmail;
  const isNonOwnerDraftUser = Boolean(
    hasDraftActions &&
      draftOwnerEmail &&
      user.email &&
      draftOwnerEmail.toLowerCase() !== user.email.toLowerCase(),
  );

  const handleDraftDelete = () => {
    sendGAEvent("dash_ellipsis_click", {
      action: "delete-draft",
    });

    userPrompt({
      header: DRAFT_DELETE_MODAL_HEADER,
      body: isNonOwnerDraftUser
        ? getNonOwnerDraftDeleteModalBody(data.id)
        : DRAFT_DELETE_MODAL_BODY,
      acceptButtonText: "Delete",
      cancelButtonText: "Cancel",
      cancelVariant: "link",
      onCancel: () => {
        // Keep users on the dashboard when they dismiss the delete draft modal.
      },
      onAccept: async () => {
        try {
          await deleteDraft(data.id);
          queryClient.removeQueries({ queryKey: ["record", data.id] });
          banner({
            header: "Draft deleted",
            body: `Draft for ${data.id} has been deleted.`,
            variant: "success",
            pathnameToDisplayOn: window.location.pathname,
          });
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["os-dashboard"] }),
            queryClient.invalidateQueries({ queryKey: ["spas"] }),
            queryClient.invalidateQueries({ queryKey: ["waivers"] }),
          ]);
          window.dispatchEvent(new Event("os-dashboard-refresh"));
        } catch (error) {
          banner({
            header: "Unable to delete draft",
            body: error instanceof Error ? error.message : String(error),
            variant: "destructive",
            pathnameToDisplayOn: window.location.pathname,
          });
        }
      },
    });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.DropdownMenuTrigger
        disabled={!actions.length && !hasDraftActions}
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
        {hasDraftActions ? (
          <>
            <DropdownMenu.Item asChild aria-label={`${DRAFT_CONTINUE_ACTION_LABEL} for ${data.id}`}>
              <Link
                onClick={() =>
                  sendGAEvent("dash_ellipsis_click", {
                    action: "continue-package",
                  })
                }
                state={{
                  from: `${window.location.pathname}${window.location.search}`,
                }}
                to={draftLink!}
                className="text-blue-500 flex select-none items-center rounded-sm px-2 py-2 text-sm hover:bg-accent"
              >
                {DRAFT_CONTINUE_ACTION_LABEL}
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild aria-label={`${DRAFT_DELETE_ACTION_LABEL} for ${data.id}`}>
              <button
                onClick={handleDraftDelete}
                className="text-blue-500 text-left flex select-none items-center rounded-sm px-2 py-2 text-sm hover:bg-accent"
                type="button"
              >
                {DRAFT_DELETE_ACTION_LABEL}
              </button>
            </DropdownMenu.Item>
          </>
        ) : (
          actions.map((action, idx) => {
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
                    from: `${window.location.pathname}${window.location.search}`,
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
          })
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
