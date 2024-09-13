import { newChipSubmission } from "./new-chip-submission";
import { newMedicaidSubmission } from "./new-medicaid-submission";
import { capitatedInitial } from "./capitated-initial";
import { contractingInitial } from "./contracting-initial";

export const submissionPayloads = {
  "capitated-initial": capitatedInitial,
  "contracting-initial": contractingInitial,
  "new-chip-submission": newChipSubmission,
  "new-medicaid-submission": newMedicaidSubmission,
};
