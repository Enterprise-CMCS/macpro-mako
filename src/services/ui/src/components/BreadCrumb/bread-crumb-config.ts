import { ROUTES } from "@/routes";

export type BreadCrumbConfig = {
  default?: boolean;
  order: number;
  to: string;
  displayText: string;
};

export const BREAD_CRUMB_CONFIG: BreadCrumbConfig[] = [
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
    displayText: "New Submissions",
    to: ROUTES.SPA_SUBMISSION_OPTIONS,
    order: 3,
  },
  {
    displayText: "New Waiver",
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
    displayText: "1915(b)(4) Waiver Types",
    to: ROUTES.B4_WAIVER_OPTIONS,
    order: 5,
  },
  {
    displayText: "1915(b) Capitated Waiver Types",
    to: ROUTES.BCAP_WAIVER_OPTIONS,
    order: 5,
  },
];
