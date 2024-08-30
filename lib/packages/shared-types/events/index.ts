export * from "./toggle-withdraw-rai-enabled";
export * from "./issue-rai";
export * from "./respond-to-rai";
export * from "./withdraw-rai";
export * from "./withdraw-package";
export * as newMedicaidSubmission from "./new-medicaid-submission"; // this should be removed once no longer in use.  use const events below
export * as newChipSubmission from "./new-chip-submission";
export * as capitatedWaivers from "./capitated-waivers";
export * as contractingWaivers from "./contracting-waivers";
export * from "./legacy-event";
export * from "./legacy-package-view";
export * from "./legacy-admin-change";
export * from "./seatool";
export * from "./remove-appk-child";
export * from "./update-id";
export * from "./complete-intake";

// const eventModules = {
//   "new-medicaid-submission": "./new-medicaid-submission",
// };

import * as newMedicaidSubmission from "./new-medicaid-submission";

export const events = {
  "new-medicaid-submission": newMedicaidSubmission,
};

export type FeSchemas = newMedicaidSubmission.FeSchema;
// | newChipSubmission.FeSchema;
