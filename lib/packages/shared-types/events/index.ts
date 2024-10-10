import { z } from "zod";
import * as newMedicaidSubmission from "./new-medicaid-submission";
import * as newChipSubmission from "./new-chip-submission";
import * as capitatedAmendment from "./capitated-amendment";
import * as capitatedIntial from "./capitated-initial";
import * as capitatedRenewal from "./capitated-renewal";
import * as contractingAmendment from "./contracting-amendment";
import * as contractingInitial from "./contracting-initial";
import * as contractingRenewal from "./contracting-renewal";
import * as temporaryExtension from "./temporary-extension";
import * as withdrawPackage from "./withdraw-package";

export * from "./toggle-withdraw-rai-enabled";
export * from "./issue-rai";
export * from "./respond-to-rai";
export * from "./withdraw-rai";
export * from "./withdraw-package";
export * from "./app-k";
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
  "new-medicaid-submission": newMedicaidSubmission,
  "temporary-extension": temporaryExtension,
  "withdraw-package": withdrawPackage,
};

export type BaseSchemas = z.infer<typeof newMedicaidSubmission.baseSchema>;
