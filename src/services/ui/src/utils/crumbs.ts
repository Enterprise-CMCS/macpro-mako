import { BreadCrumbConfig, Route, urlEmbedQuery } from "@/components";
import { SPA_ID_REGEX } from "@/consts";
import { mapActionLabel, mapSubmissionCrumb } from "@/utils";
import { Action } from "shared-types";

export const dashboardCrumb = (id?: string): BreadCrumbConfig => {
  return {
    displayText: "Dashboard",
    order: 1,
    default: true,
    to: id
      ? urlEmbedQuery("/dashboard", {
          tab: SPA_ID_REGEX.test(id) ? "spas" : "waivers",
        })
      : "/dashboard",
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
