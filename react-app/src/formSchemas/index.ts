import * as capitatedAmendment from "./capitated-amendment";
import * as capitatedInitial from "./capitated-initial";
import * as capitatedRenewal from "./capitated-renewal";
import * as contractingInitial from "./contracting-initial";
import * as contractingAmendment from "./contracting-amendment";
import * as contractingRenewal from "./contracting-renewal";
import * as newMedicaidSubmission from "./new-medicaid-submission";
import * as newChipSubmission from "./new-chip-submission";
import * as temporaryExtension from "./temporary-extension";
import * as respondtoRAI from "./respond-to-rai";

export const formSchemas = {
  "capitated-amendment": capitatedAmendment.formSchema,
  "capitated-initial": capitatedInitial.formSchema,
  "capitated-renewal": capitatedRenewal.formSchema,
  "contracting-amendment": contractingAmendment.formSchema,
  "contracting-initial": contractingInitial.formSchema,
  "contracting-renewal": contractingRenewal.formSchema,
  "new-chip-submission": newChipSubmission.formSchema,
  "new-medicaid-submission": newMedicaidSubmission.formSchema,
  "temporary-extension": temporaryExtension.formSchema,
  "respond-to-rai": respondtoRAI.formSchema,
};
