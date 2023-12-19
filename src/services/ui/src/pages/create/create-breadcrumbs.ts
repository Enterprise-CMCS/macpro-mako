// Specific to the path of each Options page
import { ROUTES } from "@/routes";
import { BreadCrumbConfig } from "@/components";
import { dashboardCrumb } from "@/utils/crumbs";

enum Keys {
  NEW_SUBMISSION = "new-submission",
  SPA_TYPE = "spa",
  SPA_MEDICAID_TYPE = "medicaid",
  SPA_MEDICAID_LANDING_ELIGIBILITY = "medicaid-eligibility",
  SPA_MEDICAID_LANDING_ABP = "medicaid-abp",
  SPA_CHIP_TYPE = "chip",
  SPA_CHIP_LANDING_ELIGIBILITY = "chip-eligibility",
  WAIVER_TYPE = "waiver",
  WAIVER_1915B_TYPE = "b",
  WAIVER_1915B_B4_TYPE = "b4",
  WAIVER_1915B_CAP_TYPE = "capitated",
}
// Display text mapper
const newSubmissionPageTitleMapper: Record<Keys, string> = {
  [Keys.NEW_SUBMISSION]: "Submission Type",
  [Keys.SPA_TYPE]: "SPA Type",
  [Keys.SPA_MEDICAID_TYPE]: "Medicaid SPA Type",
  [Keys.SPA_MEDICAID_LANDING_ELIGIBILITY]:
    "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
  [Keys.SPA_MEDICAID_LANDING_ABP]:
    "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing",
  [Keys.SPA_CHIP_TYPE]: "CHIP SPA Type",
  [Keys.SPA_CHIP_LANDING_ELIGIBILITY]: "CHIP Eligibility SPAs",
  [Keys.WAIVER_TYPE]: "Waiver Type",
  [Keys.WAIVER_1915B_TYPE]: "1915(b) Waiver Type",
  [Keys.WAIVER_1915B_B4_TYPE]:
    "1915(b)(4) FFS Selective Contracting Waiver Types",
  [Keys.WAIVER_1915B_CAP_TYPE]:
    "1915(b) Comprehensive (Capitated) Waiver Authority Types",
};
// Route mapper
const newSubmissionPageRouteMapper: Record<Keys, ROUTES> = {
  [Keys.NEW_SUBMISSION]: ROUTES.NEW_SUBMISSION_OPTIONS,
  [Keys.SPA_TYPE]: ROUTES.SPA_SUBMISSION_OPTIONS,
  [Keys.SPA_MEDICAID_TYPE]: ROUTES.MEDICAID_SPA_SUB_OPTIONS,
  [Keys.SPA_MEDICAID_LANDING_ELIGIBILITY]: ROUTES.MEDICAID_ELIGIBILITY_LANDING,
  [Keys.SPA_MEDICAID_LANDING_ABP]: ROUTES.MEDICAID_ABP_LANDING,
  [Keys.SPA_CHIP_TYPE]: ROUTES.CHIP_SPA_SUB_OPTIONS,
  [Keys.SPA_CHIP_LANDING_ELIGIBILITY]: ROUTES.CHIP_ELIGIBILITY_LANDING,
  [Keys.WAIVER_TYPE]: ROUTES.WAIVER_SUBMISSION_OPTIONS,
  [Keys.WAIVER_1915B_TYPE]: ROUTES.B_WAIVER_SUBMISSION_OPTIONS,
  [Keys.WAIVER_1915B_B4_TYPE]: ROUTES.B4_WAIVER_OPTIONS,
  [Keys.WAIVER_1915B_CAP_TYPE]: ROUTES.BCAP_WAIVER_OPTIONS,
};

export const optionCrumbsFromPath = (path: string): BreadCrumbConfig[] => [
  dashboardCrumb,
  ...path
    .split("/")
    .map((v, idx) => {
      return {
        displayText: newSubmissionPageTitleMapper[v as Keys],
        to: newSubmissionPageRouteMapper[v as Keys],
        order: idx,
      };
    })
    .filter((v) => v.displayText !== undefined),
];
