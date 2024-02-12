import { BreadCrumbConfig } from "@/components";
import { mapActionLabel, mapSubmissionCrumb } from "@/utils/labelMappers";
import { Action } from "shared-types";
import { Route } from "@/components";

export const dashboardCrumb: BreadCrumbConfig = {
  displayText: "Dashboard",
  order: 1,
  default: true,
  to: "/dashboard",
};

export const detailsCrumb = (id: string): BreadCrumbConfig => ({
  displayText: id,
  order: 2,
  to: `/details?id=${id}`,
});

export const actionCrumb = (action: Action, id: string): BreadCrumbConfig => ({
  displayText: mapActionLabel(action),
  order: 3,
  to: `/actions/${id}/${action}`,
});

export const submissionFormCrumb = (
  path: Route,
  idx: number
): BreadCrumbConfig => ({
  displayText: mapSubmissionCrumb(path),
  order: idx,
  to: path,
});
