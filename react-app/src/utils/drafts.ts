import { Authority, opensearch, SEATOOL_STATUS } from "shared-types";

import { getDashboardTabForAuthority } from "./crumbs";

export const DRAFT_CONTINUE_ACTION_LABEL = "Continue Draft";
export const DRAFT_DELETE_ACTION_LABEL = "Delete Draft";
export const DRAFT_DELETE_MODAL_HEADER = "Confirm delete";
export const DRAFT_DELETE_MODAL_BODY =
  "This action cannot be undone. Are you sure you want to delete this draft package?";
export const DRAFT_LOCKED_ALERT_TITLE = "This draft is locked";
export const getNonOwnerDraftDeleteModalBody = (packageId: string) =>
  `Since you are not the draft owner, are you sure you want to delete draft package ${packageId}? This action cannot be undone.`;
export const getDraftLockedMessage = (packageId: string) =>
  `A package with ID ${packageId} already exists in SEA Tool. This draft can no longer be saved or submitted in OneMAC. Delete this draft if you no longer need it.`;

const EVENT_TO_DRAFT_PATH: Record<string, string> = {
  "new-medicaid-submission": "/new-submission/spa/medicaid/create",
  "new-chip-submission": "/new-submission/spa/chip/create",
  "new-chip-details-submission": "/new-submission/spa/chip/create/chip-details",
  "capitated-initial": "/new-submission/waiver/b/capitated/initial/create",
  "capitated-renewal": "/new-submission/waiver/b/capitated/renewal/create",
  "capitated-amendment": "/new-submission/waiver/b/capitated/amendment/create",
  "contracting-initial": "/new-submission/waiver/b/b4/initial/create",
  "contracting-renewal": "/new-submission/waiver/b/b4/renewal/create",
  "contracting-amendment": "/new-submission/waiver/b/b4/amendment/create",
  "temporary-extension": "/new-submission/waiver/temporary-extensions",
  "app-k": "/new-submission/waiver/app-k",
};

export const getDraftEditLink = (record: opensearch.main.Document) => {
  if (record.seatoolStatus !== SEATOOL_STATUS.DRAFT) return null;
  if (!record.event || !(record.event in EVENT_TO_DRAFT_PATH)) return null;

  const searchParams = new URLSearchParams({
    draftId: record.id,
  });

  try {
    const origin = getDashboardTabForAuthority(record.authority as Authority);
    searchParams.set("origin", origin);
  } catch {
    // If authority is missing/invalid, omit origin and default back to dashboard.
  }

  return {
    pathname: EVENT_TO_DRAFT_PATH[record.event],
    search: searchParams.toString(),
  };
};

export const getDraftDashboardLink = (record: opensearch.main.Document) => {
  try {
    const tab = getDashboardTabForAuthority(record.authority as Authority);
    return `/dashboard?tab=${tab}`;
  } catch {
    return "/dashboard";
  }
};
