import { newChipSubmission } from "./new-chip-submission";
import { newMedicaidSubmission } from "./new-medicaid-submission";
import { capitatedAmendment } from "./capitated-amendment";
import { capitatedInitial } from "./capitated-initial";
import { capitatedRenewal } from "./capitated-renewal";
import { contractingAmendment } from "./contracting-amendment";
import { contractingInitial } from "./contracting-initial";
import { contractingRenewal } from "./contracting-renewal";
import { temporaryExtension } from "./temporary-extension";
import { withdrawPackage } from "./withdraw-package";
import { withdrawRai } from "./withdraw-rai";
import { toggleWithdrawRai } from "./toggle-withdraw-rai";

export const submissionPayloads = {
  "capitated-amendment": capitatedAmendment,
  "capitated-initial": capitatedInitial,
  "capitated-renewal": capitatedRenewal,
  "contracting-amendment": contractingAmendment,
  "contracting-initial": contractingInitial,
  "contracting-renewal": contractingRenewal,
  "new-chip-submission": newChipSubmission,
  "new-medicaid-submission": newMedicaidSubmission,
  "temporary-extension": temporaryExtension,
  "withdraw-package": withdrawPackage,
  "withdraw-rai": withdrawRai,
  "toggle-withdraw-rai": toggleWithdrawRai,
};
