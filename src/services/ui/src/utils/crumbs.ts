import { BreadCrumbConfig, Route } from "@/components";
import { mapActionLabel, mapSubmissionCrumb } from "@/utils";
import { Action, AuthorityUnion } from "shared-types";

type DetailsAndActionsBreadCrumbsArgs = {
  id: string;
  authority: AuthorityUnion;
  actionType?: Action;
};

export const getDashboardTabForAuthority = (authority: AuthorityUnion) => {
  if (authority === "CHIP SPA" || authority === "Medicaid SPA") {
    return "spas";
  }

  return "waivers";
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

export const dashboardCrumb = (
  authority?: AuthorityUnion,
): BreadCrumbConfig => {
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
  authority: AuthorityUnion,
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
