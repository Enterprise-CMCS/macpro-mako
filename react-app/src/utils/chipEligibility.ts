import { opensearch } from "shared-types";

export const CHIP_SPA_SUBMISSION_EVENT = "new-chip-submission";
export const CHIP_ELIGIBILITY_SUBMISSION_EVENT = "new-chip-details-submission";

const hasNonEmptyArray = (value: unknown) => Array.isArray(value) && value.length > 0;

export const hasChipSubmissionType = (submission: opensearch.main.Document) =>
  hasNonEmptyArray(submission.chipSubmissionType) ||
  hasNonEmptyArray(submission.draft?.data?.chipSubmissionType);

export const hasChipEligibilityAttachment = (submission: opensearch.main.Document) =>
  hasNonEmptyArray(submission.attachments?.chipEligibility?.files);

export const isChipEligibilityPackage = (submission: opensearch.main.Document) =>
  submission.event === CHIP_ELIGIBILITY_SUBMISSION_EVENT ||
  hasChipSubmissionType(submission) ||
  hasChipEligibilityAttachment(submission);

export const getEffectiveInitialSubmissionEvent = (
  submission: opensearch.main.Document,
  originalSubmissionEvent: string | null,
) => {
  if (isChipEligibilityPackage(submission)) {
    return CHIP_ELIGIBILITY_SUBMISSION_EVENT;
  }

  return originalSubmissionEvent;
};
