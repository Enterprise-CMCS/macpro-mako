import { BreadCrumbConfig, Route } from "@/components";
import { mapActionLabel, mapSubmissionCrumb } from "@/utils";
import { Action } from "shared-types/actions";
import { Authority } from "shared-types/authority";

type DetailsAndActionsBreadCrumbsArgs = {
  id: string;
  authority: Authority;
  actionType?: Action;
};

export const getDashboardTabForAuthority = (
  authority: Authority,
): "spas" | "waivers" => {
  switch (authority) {
    case "CHIP SPA" as Authority:
    case "Medicaid SPA" as Authority:
      return "spas";
    case "1915(b)":
    case "1915(c)":
      return "waivers";
    default:
      throw new Error("Invalid authority");
  }
};

export const detailsAndActionsCrumbs = ({
  id,
  authority,
  actionType,
}: DetailsAndActionsBreadCrumbsArgs): BreadCrumbConfig[] => {
  const defaultBreadCrumbs = [
    dashboardCrumb(authority),
    detailsCrumb(id, authority),
  ];

  return actionType
    ? [...defaultBreadCrumbs, actionCrumb(actionType, id)]
    : defaultBreadCrumbs;
};

export const dashboardCrumb = (authority?: Authority): BreadCrumbConfig => {
  return {
    displayText: "Dashboard",
    order: 1,
    default: true,
    to: authority
      ? `/dashboard?tab=${getDashboardTabForAuthority(authority)}`
      : "/dashboard",
  };
};

export const detailsCrumb = (
  id: string,
  authority: Authority,
): BreadCrumbConfig => ({
  displayText: id,
  order: 2,
  to: `/details/${authority}/${id}`,
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
