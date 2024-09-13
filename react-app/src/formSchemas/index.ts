import * as capitatedInitial from "./capitated-initial";
import * as newMedicaidSubmission from "./new-medicaid-submission";
import * as newChipSubmission from "./new-chip-submission";

export const formSchemas = {
  "capitated-initial": capitatedInitial.formSchema,
  "new-chip-submission": newChipSubmission.formSchema,
  "new-medicaid-submission": newMedicaidSubmission.formSchema,
};
