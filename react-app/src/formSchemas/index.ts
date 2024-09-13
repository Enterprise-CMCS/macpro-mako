import * as capitatedInitial from "./capitated-initial";
import * as contractingInitial from "./contracting-initial";
import * as newMedicaidSubmission from "./new-medicaid-submission";
import * as newChipSubmission from "./new-chip-submission";

export const formSchemas = {
  "contracting-initial": contractingInitial.formSchema,
  "capitated-initial": capitatedInitial.formSchema,
  "new-chip-submission": newChipSubmission.formSchema,
  "new-medicaid-submission": newMedicaidSubmission.formSchema,
};
