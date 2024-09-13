import { newChipSubmission } from "./new-chip-submission";
import { newMedicaidSubmission } from "./new-medicaid-submission";
import { capitatedInitial } from "./capitated-initial";

export const submissionPayloads = {
  "new-chip-submission": newChipSubmission,
  "new-medicaid-submission": newMedicaidSubmission,
  "capitated-initial": capitatedInitial,
};
