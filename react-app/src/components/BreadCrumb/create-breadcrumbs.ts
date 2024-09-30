import { dashboardCrumb } from "@/utils";
import { BreadCrumbConfig } from "@/components";
import { Authority } from "shared-types";

const newSubmissionPageRouteMapper: Record<
  string,
  { to: string; displayText: string }
> = {
  "new-submission": {
    to: "/new-submission",
    displayText: "Submission Type",
  },
  spa: {
    to: "/new-submission/spa",
    displayText: "SPA Type",
  },
  medicaid: {
    to: "/new-submission/spa/medicaid",
    displayText: "Medicaid SPA Type",
  },
  "medicaid-eligibility": {
    to: "/new-submission/spa/medicaid/landing/medicaid-eligibility",
    displayText:
      "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
  },
  "medicaid-abp": {
    to: "/new-submission/spa/medicaid/landing/medicaid-abp",
    displayText:
      "Medicaid Alternative Benefits Plans (ABP), and Medicaid Premiums and Cost Sharing",
  },
  chip: {
    to: "/new-submission/spa/chip",
    displayText: "CHIP SPA Type",
  },
  "chip-eligibility": {
    to: "/new-submission/spa/chip/landing/chip-eligibility",
    displayText: "CHIP Eligibility SPAs",
  },
  waiver: {
    to: "/new-submission/waiver",
    displayText: "Waiver Type",
  },
  b: {
    to: "/new-submission/waiver/b",
    displayText: "1915(b) Waiver Type",
  },
  b4: {
    to: "/new-submission/waiver/b/b4",
    displayText: "1915(b)(4) FFS Selective Contracting Waiver Types",
  },
  capitated: {
    to: "/new-submission/waiver/b/capitated",
    displayText: "1915(b) Comprehensive (Capitated) Waiver Authority Types",
  },
};

export const optionCrumbsFromPath = (
  path: string,
  authority?: Authority,
): BreadCrumbConfig[] =>
  [dashboardCrumb(authority)].concat(
    path.split("/").reduce<BreadCrumbConfig[]>((acc, subPath, index) => {
      if (subPath in newSubmissionPageRouteMapper) {
        console.log(subPath, "sub path");
        console.log(newSubmissionPageRouteMapper, "page route mapper");
        return acc.concat({
          ...newSubmissionPageRouteMapper[subPath],
          order: index,
        });
      }

      console.log(acc, "out here");
      return acc;
    }, []),
  );
