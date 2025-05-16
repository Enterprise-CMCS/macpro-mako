import { z } from "zod";

import * as appk from "./app-k";
import * as capitatedAmendment from "./capitated-amendment";
import * as capitatedIntial from "./capitated-initial";
import * as capitatedRenewal from "./capitated-renewal";
import * as contractingAmendment from "./contracting-amendment";
import * as contractingInitial from "./contracting-initial";
import * as contractingRenewal from "./contracting-renewal";
import * as legacyAdminChange from "./legacy-admin-change";
import * as legacyEvent from "./legacy-event";
import * as newChipDetailsSubmission from "./new-chip-details-submission";
import * as newChipSubmission from "./new-chip-submission";
import * as newMedicaidSubmission from "./new-medicaid-submission";
import * as respondToRai from "./respond-to-rai";
import * as temporaryExtension from "./temporary-extension";
import * as toggleWithdrawRai from "./toggle-withdraw-rai";
import * as uploadSubsequentDocuments from "./upload-subsequent-documents";
import * as withdrawPackage from "./withdraw-package";
import * as withdrawRai from "./withdraw-rai";

export * from "./respond-to-rai";
export * from "./legacy-event";
export * from "./legacy-package-view";
export * from "./legacy-admin-change";
export * from "./seatool";
export * from "./remove-appk-child";
export * from "./update-id";

export const events = {
  "capitated-amendment": capitatedAmendment,
  "capitated-initial": capitatedIntial,
  "capitated-renewal": capitatedRenewal,
  "contracting-amendment": contractingAmendment,
  "contracting-initial": contractingInitial,
  "contracting-renewal": contractingRenewal,
  "new-chip-submission": newChipSubmission,
  "new-chip-details-submission": newChipDetailsSubmission,
  "new-medicaid-submission": newMedicaidSubmission,
  "temporary-extension": temporaryExtension,
  "withdraw-package": withdrawPackage,
  "withdraw-rai": withdrawRai,
  "toggle-withdraw-rai": toggleWithdrawRai,
  "respond-to-rai": respondToRai,
  "upload-subsequent-documents": uploadSubsequentDocuments,
  "app-k": appk,
  "legacy-event": legacyEvent,
  "legacy-admin-change": legacyAdminChange,
};

export type BaseSchemas = z.infer<typeof newMedicaidSubmission.baseSchema>;

export type Events = {
  AppKSubmission: z.infer<typeof appk.schema>;
  CapitatedInitial: z.infer<typeof capitatedIntial.schema>;
  CapitatedRenewal: z.infer<typeof capitatedRenewal.schema>;
  CapitatedAmendment: z.infer<typeof capitatedAmendment.schema>;
  ContractingInitial: z.infer<typeof contractingInitial.schema>;
  ContractingRenewal: z.infer<typeof contractingRenewal.schema>;
  ContractingAmendment: z.infer<typeof contractingAmendment.schema>;
  NewChipSubmission: z.infer<typeof newChipSubmission.schema>;
  NewChipDetailsSubmission: z.infer<typeof newChipDetailsSubmission.schema>;
  NewMedicaidSubmission: z.infer<typeof newMedicaidSubmission.schema>;
  TemporaryExtension: z.infer<typeof temporaryExtension.schema>;
  RespondToRai: z.infer<typeof respondToRai.schema>;
  UploadSubsequentDocuments: z.infer<typeof uploadSubsequentDocuments.schema>;
  WithdrawPackage: z.infer<typeof withdrawPackage.schema>;
  WithdrawRai: z.infer<typeof withdrawRai.schema>;
  ToggleWithdrawRai: z.infer<typeof toggleWithdrawRai.schema>;
};
