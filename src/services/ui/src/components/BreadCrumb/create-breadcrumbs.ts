// Specific to the path of each Options page
import { submissionFormCrumb, dashboardCrumb } from "@/utils";
import { BreadCrumbConfig } from "@/components";
import { Route } from "@/components";

type Keys =
  | "new-submission"
  | "spa"
  | "medicaid"
  | "medicaid-eligibility"
  | "medicaid-abp"
  | "chip"
  | "chip-eligibility"
  | "waiver"
  | "b"
  | "b4"
  | "capitated";
// Display text mapper
const newSubmissionPageTitleMapper: Record<Keys, string> = {
  "new-submission": "Submission Type",
  spa: "SPA Type",
  medicaid: "Medicaid SPA Type",
  "medicaid-eligibility":
    "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
  "medicaid-abp":
    "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing",
  chip: "CHIP SPA Type",
  "chip-eligibility": "CHIP Eligibility SPAs",
  waiver: "Waiver Type",
  b: "1915(b) Waiver Type",
  b4: "1915(b)(4) FFS Selective Contracting Waiver Types",
  capitated: "1915(b) Comprehensive (Capitated) Waiver Authority Types",
};
// Route mapper
const newSubmissionPageRouteMapper: Record<Keys, Route> = {
  "new-submission": "/new-submission",
  spa: "/new-submission/spa",
  medicaid: "/new-submission/spa/medicaid",
  "medicaid-eligibility":
    "/new-submission/spa/medicaid/landing/medicaid-eligibility",
  "medicaid-abp": "/new-submission/spa/medicaid/landing/medicaid-abp",
  chip: "/new-submission/spa/chip",
  "chip-eligibility": "/new-submission/spa/chip/landing/chip-eligibility",
  waiver: "/new-submission/waiver",
  b: "/new-submission/waiver/b",
  b4: "/new-submission/waiver/b/b4",
  capitated: "/new-submission/waiver/b/capitated",
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

export const formCrumbsFromPath = (path: string) => {
  // We broke this out of the Option crumb flow as that's more complex due to the nature
  // of the options triage (New Submission choice flow).
  const previousOptionsCrumbs = [...optionCrumbsFromPath(path)];
  return [
    ...previousOptionsCrumbs,
    submissionFormCrumb(path as Route, previousOptionsCrumbs.length),
  ];
};
