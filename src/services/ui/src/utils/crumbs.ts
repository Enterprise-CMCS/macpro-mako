import {
  BreadCrumbConfig,
  OsUrlState,
  Route,
  urlEmbedQuery,
} from "@/components";
import { authorityById, mapActionLabel, mapSubmissionCrumb } from "@/utils";
import { Action } from "shared-types";

export const dashboardCrumb = (id?: string): BreadCrumbConfig => {
  if (id) {
    const authority = authorityById(id);
    const newPath = urlEmbedQuery<Partial<OsUrlState>>("/dashboard", {
      tab: authority === "" ? "spas" : authority,
    });
    return {
      displayText: "Dashboard",
      order: 1,
      default: true,
      to: newPath,
    };
  }
  return {
    displayText: "Dashboard",
    order: 1,
    default: true,
    to: "/dashboard",
  };
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
  idx: number,
): BreadCrumbConfig => ({
  displayText: mapSubmissionCrumb(path),
  order: idx,
  to: path,
});
