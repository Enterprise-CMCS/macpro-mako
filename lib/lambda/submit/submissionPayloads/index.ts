import { newChipSubmission } from "./new-chip-submission";
import { newMedicaidSubmission } from "./new-medicaid-submission";
import { capitatedAmendment } from "./capitated-amendment";
import { capitatedInitial } from "./capitated-initial";
import { contractingAmendment } from "./contracting-amendment";
import { contractingInitial } from "./contracting-initial";

export const submissionPayloads = {
  "capitated-amendment": capitatedAmendment,
  "capitated-initial": capitatedInitial,
  "contracting-amendment": contractingAmendment,
  "contracting-initial": contractingInitial,
  "new-chip-submission": newChipSubmission,
  "new-medicaid-submission": newMedicaidSubmission,
};
