import * as capitatedAmendment from "./capitated-amendment";
import * as capitatedInitial from "./capitated-initial";
import * as capitatedRenewal from "./capitated-renewal";
import * as contractingInitial from "./contracting-initial";
import * as contractingAmendment from "./contracting-amendment";
import * as contractingRenewal from "./contracting-renewal";
import * as newMedicaidSubmission from "./new-medicaid-submission";
import * as uploadSubsequentDocuments from "./upload-subsequent-documents";
import * as newChipSubmission from "./new-chip-submission";
import * as temporaryExtension from "./temporary-extension";
import * as withdrawPackage from "./withdraw-package";
import * as withdrawRai from "./withdraw-rai";
import * as toggleWithdrawRai from "./toggle-withdraw-rai";
import * as respondtoRAI from "./respond-to-rai";
import * as appK from "./app-k";

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
  "withdraw-package": withdrawPackage.formSchema,
  "withdraw-package-chip": withdrawPackage.formSchemaChip,
  "withdraw-rai": withdrawRai.formSchema,
  "toggle-withdraw-rai": toggleWithdrawRai.formSchema,
  "respond-to-rai-chip": respondtoRAI.formSchemaChip,
  "respond-to-rai-waiver": respondtoRAI.formSchemaWaivers,
  "respond-to-rai-medicaid": respondtoRAI.formSchemaMedicaid,
  "app-k": appK.formSchema,
  "upload-subsequent-documents": uploadSubsequentDocuments.formSchema,
};
