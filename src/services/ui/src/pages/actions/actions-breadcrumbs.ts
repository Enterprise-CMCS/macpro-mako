import { Action } from "shared-types";
import { BreadCrumbConfig } from "@/components";
import { actionCrumb, dashboardCrumb, detailsCrumb } from "@/utils/crumbs";

export const DETAILS_AND_ACTIONS_CRUMBS = ({
  id,
  action,
}: {
  id: string;
  action?: Action;
}): BreadCrumbConfig[] => {
  const base = [dashboardCrumb, detailsCrumb(id)];
  return !action ? base : [...base, actionCrumb(action, id)];
};
