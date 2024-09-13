import * as capitatedAmendment from "./capitated-amendment";
import * as capitatedInitial from "./capitated-initial";
import * as contractingInitial from "./contracting-initial";
import * as contractingAmendment from "./contracting-amendment";
import * as newMedicaidSubmission from "./new-medicaid-submission";
import * as newChipSubmission from "./new-chip-submission";

export const formSchemas = {
  "capitated-amendment": capitatedAmendment.formSchema,
  "capitated-initial": capitatedInitial.formSchema,
  "contracting-amendment": contractingAmendment.formSchema,
  "contracting-initial": contractingInitial.formSchema,
  "new-chip-submission": newChipSubmission.formSchema,
  "new-medicaid-submission": newMedicaidSubmission.formSchema,
};
