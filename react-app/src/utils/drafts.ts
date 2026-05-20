import { Authority, opensearch, SEATOOL_STATUS } from "shared-types";

import { getDashboardTabForAuthority } from "./crumbs";

export const DRAFT_CONTINUE_ACTION_LABEL = "Continue Package";
export const DRAFT_DELETE_ACTION_LABEL = "Delete Package";
export const DRAFT_DELETE_MODAL_HEADER = "Confirm delete";
export const DRAFT_DELETE_MODAL_BODY =
  "This action cannot be undone. Are you sure you want to delete this draft package?";
export const DRAFT_ID_CONFLICT_BANNER_TITLE = "ID Update Required";
export const DRAFT_ID_CONFLICT_MESSAGE =
  "A matching submission ID was submitted to CMS outside of OneMAC after this draft was last saved. You must update the ID before saving or submitting. Alternatively, you can delete this draft if no longer needed.";
const DRAFT_ID_CONFLICT_FIELD_MESSAGES: Record<string, string> = {
  "new-medicaid-submission":
    "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
  "new-chip-submission":
    "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
  "new-chip-details-submission":
    "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
  "capitated-initial":
    "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
  "contracting-initial":
    "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
  "capitated-renewal":
    "According to our records, this 1915(b) Waiver Renewal Number already exists. Please check the 1915(b) Waiver Renewal Number and try entering it again.",
  "contracting-renewal":
    "According to our records, this 1915(b) Waiver Renewal Number already exists. Please check the 1915(b) Waiver Renewal Number and try entering it again.",
  "capitated-amendment":
    "According to our records, this 1915(b) Waiver Amendment Number already exists. Please check the 1915(b) Waiver Amendment Number and try entering it again.",
  "contracting-amendment":
    "According to our records, this 1915(b) Waiver Amendment Number already exists. Please check the 1915(b) Waiver Amendment Number and try entering it again.",
  "temporary-extension":
    "According to our records, this Temporary Extension Request Number already exists. Please check the Temporary Extension Request Number and try entering it again.",
  "app-k":
    "According to our records, this Waiver Amendment Number already exists. Please check the Waiver Amendment Number and try entering it again.",
};
export const getNonOwnerDraftWarningModalBody = (packageId: string) =>
  `Since you are not the creator or most recent editor, are you sure you want to take this action on ${packageId}?`;
export const getNonOwnerDraftDeleteModalBody = (packageId: string) =>
  `Since you are not the creator or most recent editor, are you sure you want to delete draft package ${packageId}? This action cannot be undone.`;
const DRAFT_CONTINUE_CONFIRMATION_STORAGE_KEY_PREFIX = "onemac:draft-continue-confirmed";

type DraftActorIdentity = {
  email?: string | null;
  name?: string | null;
};

type CurrentUserIdentity = {
  email?: string | null;
  fullName?: string | null;
  name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
};

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";
const normalizeName = (name?: string | null) => name?.trim().toLowerCase() || "";
const normalizePackageId = (packageId?: string | null) => packageId?.trim().toUpperCase() || "";

const getDraftContinueConfirmationKey = (packageId: string, email?: string | null) =>
  `${DRAFT_CONTINUE_CONFIRMATION_STORAGE_KEY_PREFIX}:${normalizePackageId(packageId)}:${normalizeEmail(email)}`;

export const getDraftIdConflictFieldMessage = (event?: string | null) =>
  (event && DRAFT_ID_CONFLICT_FIELD_MESSAGES[event]) ||
  "According to our records, this ID already exists. Please check the ID and try entering it again.";

export const markDraftContinueConfirmed = (packageId: string, email?: string | null) => {
  try {
    sessionStorage.setItem(getDraftContinueConfirmationKey(packageId, email), "true");
  } catch {
    // Ignore storage failures; the save/submit prompt remains as a fallback.
  }
};

export const consumeDraftContinueConfirmed = (packageId: string, email?: string | null) => {
  try {
    const key = getDraftContinueConfirmationKey(packageId, email);
    const wasConfirmed = sessionStorage.getItem(key) === "true";
    if (wasConfirmed) {
      sessionStorage.removeItem(key);
    }
    return wasConfirmed;
  } catch {
    return false;
  }
};

export const isCurrentUserDraftActor = (
  currentUser: CurrentUserIdentity | null | undefined,
  actors: DraftActorIdentity[],
) => {
  const currentEmail = normalizeEmail(currentUser?.email);
  const currentName = normalizeName(
    currentUser?.fullName ??
      currentUser?.name ??
      [currentUser?.given_name, currentUser?.family_name].filter(Boolean).join(" "),
  );

  return actors.some((actor) => {
    const actorEmail = normalizeEmail(actor.email);

    if (currentEmail && actorEmail) {
      return currentEmail === actorEmail;
    }

    // Legacy draft records may only have an owner name. Only fall back to name
    // matching when the actor email is absent so explicit email ownership wins.
    const actorName = normalizeName(actor.name);
    return !actorEmail && currentName && actorName === currentName;
  });
};

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
