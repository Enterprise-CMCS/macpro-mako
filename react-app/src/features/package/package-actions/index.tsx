import { Link, useLocation, useNavigate } from "react-router";
import { opensearch, SEATOOL_STATUS } from "shared-types";
import { isStateUser } from "shared-utils";

import { deleteDraft, useGetPackageActions, useGetUser } from "@/api";
import { banner, LoadingSpinner, userPrompt } from "@/components";
import {
  DETAILS_ORIGIN,
  mapActionLabel,
  ORIGIN,
  queryClient,
  WAIVER_SUBMISSION_ORIGIN,
} from "@/utils";
import {
  DRAFT_CONTINUE_ACTION_LABEL,
  DRAFT_DELETE_ACTION_LABEL,
  DRAFT_DELETE_MODAL_BODY,
  DRAFT_DELETE_MODAL_HEADER,
  getDraftDashboardLink,
  getDraftEditLink,
  getNonOwnerDraftDeleteModalBody,
} from "@/utils/drafts";

type PackageActionsCardProps = {
  id: string;
  submission: opensearch.main.Document;
};

export const PackageActionsCard = ({ submission, id }: PackageActionsCardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: oneMacUser, isLoading: isUserLoading } = useGetUser();
  const isDraft = submission.seatoolStatus === SEATOOL_STATUS.DRAFT;
  const draftLink = isDraft ? getDraftEditLink(submission) : null;
  const draftCreatorEmail =
    submission.draft?.createdByEmail ??
    submission.draft?.draftOwnerEmail ??
    submission.submitterEmail;
  const draftUpdaterEmail = submission.draft?.updatedByEmail ?? submission.submitterEmail;
  const currentUserEmail = oneMacUser?.user?.email?.toLowerCase();
  const isNonOwnerDraftUser = Boolean(
    isDraft &&
      currentUserEmail &&
      ![draftCreatorEmail, draftUpdaterEmail].some(
        (email) => email?.toLowerCase() === currentUserEmail,
      ),
  );
  const canManageDraft = isDraft && !!oneMacUser?.user && isStateUser(oneMacUser.user);
  const draftDashboardLink = getDraftDashboardLink(submission);

  const { data, isLoading } = useGetPackageActions(id, {
    retry: false,
    enabled: !isDraft,
  });

  if (isDraft && isUserLoading) {
    return <LoadingSpinner />;
  }

  const handleDeleteDraft = () => {
    userPrompt({
      header: DRAFT_DELETE_MODAL_HEADER,
      body: isNonOwnerDraftUser ? getNonOwnerDraftDeleteModalBody(id) : DRAFT_DELETE_MODAL_BODY,
      acceptButtonText: "Delete",
      cancelButtonText: "Cancel",
      cancelVariant: "link",
      onCancel: () => {
        // Keep users on package details when they dismiss the delete draft modal.
      },
      onAccept: async () => {
        try {
          await deleteDraft(id);
          banner({
            header: "Draft deleted",
            body: `Draft for ${id} has been deleted.`,
            variant: "success",
            pathnameToDisplayOn: "/dashboard",
          });
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["os-dashboard"] }),
            queryClient.invalidateQueries({ queryKey: ["spas"] }),
            queryClient.invalidateQueries({ queryKey: ["waivers"] }),
          ]);

          navigate(draftDashboardLink, { replace: true });
          window.setTimeout(() => {
            // Clear the deleted draft cache after leaving details so the mounted page
            // does not briefly render its generic error state before navigation completes.
            queryClient.removeQueries({ queryKey: ["record", id] });
          }, 0);
        } catch (error) {
          banner({
            header: "Unable to delete draft",
            body: error instanceof Error ? error.message : String(error),
            variant: "destructive",
            pathnameToDisplayOn: location.pathname,
          });
        }
      },
    });
  };

  if (isDraft && canManageDraft) {
    return (
      <nav className="my-3 sm:text-nowrap sm:min-w-min" aria-labelledby="package-actions-heading">
        <ul className="my-3">
          {draftLink && (
            <li className="py-2">
              <Link
                state={{
                  from: `${location.pathname}${location.search}`,
                }}
                to={draftLink}
                className="text-sky-700 font-semibold text-lg hover:underline hover:decoration-inherit"
              >
                {DRAFT_CONTINUE_ACTION_LABEL}
              </Link>
            </li>
          )}
          <li className="py-2">
            <button
              className="text-sky-700 font-semibold text-lg hover:underline hover:decoration-inherit"
              onClick={handleDeleteDraft}
              type="button"
            >
              {DRAFT_DELETE_ACTION_LABEL}
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  if (isDraft) {
    return (
      <div className="my-3" aria-labelledby="package-actions-heading">
        <em className="text-gray-400 my-3">
          No actions are currently available for this submission.
        </em>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  if (!data?.actions?.length) {
    return (
      <div className="my-3" aria-labelledby="package-actions-heading">
        <em className="text-gray-400 my-3">
          No actions are currently available for this submission.
        </em>
      </div>
    );
  }

  return (
    <nav className="my-3 sm:text-nowrap sm:min-w-min" aria-labelledby="package-actions-heading">
      <ul className="my-3">
        {data.actions.map((type, idx) => (
          <li className="py-2" key={`${type}-${idx}`}>
            <Link
              key={`${idx}-${type}`}
              state={{
                from: `${location.pathname}${location.search}`,
              }}
              to={{
                pathname: `/actions/${type}/${submission.authority}/${id}`,
                search: new URLSearchParams({
                  [ORIGIN]:
                    type === "amend-waiver" || type === "temporary-extension"
                      ? WAIVER_SUBMISSION_ORIGIN
                      : DETAILS_ORIGIN,
                }).toString(),
              }}
              className="text-sky-700 font-semibold text-lg hover:underline hover:decoration-inherit"
            >
              {mapActionLabel(type)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
