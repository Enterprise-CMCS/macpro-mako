import { Authority } from "shared-types";

import { BreadCrumbConfig } from "@/components";
import { dashboardCrumb } from "@/utils";

const newSubmissionPageRouteMapper: Record<string, { to: string; displayText: string }> = {
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
    displayText: "Medicaid Eligibility, Enrollment, Administration, and Health Homes",
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
  "chip-details": {
    to: "/new-submission/spa/chip/create/chip-details",
    displayText: "CHIP SPA Details",
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
  id?: string,
): BreadCrumbConfig[] => {
  const breadcrumbs = [dashboardCrumb(authority)].concat(
    path.split("/").reduce<BreadCrumbConfig[]>((acc, subPath, index) => {
      if (subPath in newSubmissionPageRouteMapper) {
        return acc.concat({
          ...newSubmissionPageRouteMapper[subPath],
          order: index,
        });
      }

      return acc;
    }, []),
  );

  if (id) {
    return breadcrumbs.concat({
      displayText: id,
      to: `/details/${authority}/${id}`,
      order: breadcrumbs.length,
    });
  }

  return breadcrumbs;
};
