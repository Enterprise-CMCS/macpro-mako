import { SEATOOL_STATUS } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";

const hasKnownSeatoolStatus = (packageResult?: ItemResult): boolean => {
  const seatoolStatus = packageResult?._source?.seatoolStatus;
  return typeof seatoolStatus === "string" && seatoolStatus.trim().length > 0;
};

// Partial upserts can leave shell docs in `main` that only contain an id/timestamp.
// Those incomplete records should not block draft ID reuse or win package resolution.
export const isActiveMainNonDraftPackage = (packageResult?: ItemResult): boolean => {
  if (packageResult?.found !== true || packageResult._source?.deleted === true) {
    return false;
  }

  if (!hasKnownSeatoolStatus(packageResult)) {
    return false;
  }

  return packageResult._source.seatoolStatus !== SEATOOL_STATUS.DRAFT;
};

export const isActiveDraftPackage = (packageResult?: ItemResult): boolean => {
  return (
    packageResult?.found === true &&
    packageResult._source?.deleted !== true &&
    packageResult._source?.seatoolStatus === SEATOOL_STATUS.DRAFT
  );
};

export const isDeletedDraftPackage = (packageResult?: ItemResult): boolean => {
  return (
    packageResult?.found === true &&
    packageResult._source?.deleted === true &&
    packageResult._source?.seatoolStatus === SEATOOL_STATUS.DRAFT
  );
};
