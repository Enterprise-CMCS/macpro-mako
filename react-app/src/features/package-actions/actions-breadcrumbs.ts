import { Action } from "shared-types";
import { BreadCrumbConfig } from "@/components";
import { actionCrumb, dashboardCrumb, detailsCrumb } from "@/utils";

export const detailsAndActionsCrumbs = ({
  id,
  action,
}: {
  id: string;
  action?: Action;
}): BreadCrumbConfig[] => {
  const base = [dashboardCrumb(id), detailsCrumb(id)];
  return !action ? base : [...base, actionCrumb(action, id)];
};
