import { ROUTES } from "@/routes";

export type BreadCrumbConfig = {
  default?: boolean;
  order: number;
  to: string;
  displayText: string;
};

export const BREAD_CRUMB_CONFIG_NEW_SUBMISSION: BreadCrumbConfig[] = [
  {
    default: true,
    displayText: "Dashboard",
    to: ROUTES.DASHBOARD,
    order: 1,
  },
  {
    displayText: "Submission Type",
    to: ROUTES.NEW_SUBMISSION_OPTIONS,
    order: 2,
  },
  {
    displayText: "SPA Type",
    to: ROUTES.SPA_SUBMISSION_OPTIONS,
    order: 3,
  },
  {
    displayText: "Waiver Type",
    to: ROUTES.WAIVER_SUBMISSION_OPTIONS,
    order: 3,
  },
  {
    displayText: "1915(b) Waiver Type",
    to: ROUTES.B_WAIVER_SUBMISSION_OPTIONS,
    order: 4,
  },
  {
    displayText: "Medicaid SPA Type",
    to: ROUTES.MEDICAID_SPA_SUB_OPTIONS,
    order: 4,
  },
  {
    displayText: "Chip SPA Type",
    to: ROUTES.CHIP_SPA_SUB_OPTIONS,
    order: 4,
  },
  {
    displayText: "CHIP Eligibility SPAs",
    to: ROUTES.CHIP_ELIGIBILITY_LANDING,
    order: 5,
  },
  {
    displayText: "Medicaid Alternative Benefits Plans (ABP)",
    to: ROUTES.MEDICAID_ABP_LANDING,
    order: 5,
  },
  {
    displayText: "Medicaid Eligibility",
    to: ROUTES.MEDICAID_ELIGIBILITY_LANDING,
    order: 5,
  },
  {
    displayText: "1915(b)(4) FFS Selective Contracting Waiver Types",
    to: ROUTES.B4_WAIVER_OPTIONS,
    order: 5,
  },
  {
    displayText: "1915(b) Comprehensive (Capitated) Waiver Authority Types",
    to: ROUTES.BCAP_WAIVER_OPTIONS,
    order: 5,
  },
];

export const BREAD_CRUMB_CONFIG_PACKAGE_DETAILS = (data: {
  type: string;
  id: string;
}): BreadCrumbConfig[] => [
  {
    displayText: "Dashboard",
    order: 1,
    default: true,
    to: ROUTES.DASHBOARD,
  },
  {
    displayText: `${data.id}`,
    order: 2,
    to: ROUTES.DETAILS,
  },
];
