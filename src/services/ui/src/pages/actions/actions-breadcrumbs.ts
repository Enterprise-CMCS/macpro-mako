import { ROUTES } from "@/routes";
import { mapActionLabel } from "@/utils";
import { Action } from "shared-types";
import { BreadCrumbConfig } from "@/components";

export const DETAILS_AND_ACTIONS_CRUMBS = (data: {
  id: string;
  action?: Action;
}): BreadCrumbConfig[] => {
  const base = [
    {
      displayText: "Dashboard",
      order: 1,
      default: true,
      to: ROUTES.DASHBOARD,
    },
    {
      displayText: data.id,
      order: 2,
      to: `/details?id=${data.id}`,
    },
  ];
  return !data.action
    ? base
    : ([
        ...base,
        {
          displayText: mapActionLabel(data.action),
          order: 3,
          to: `/actions/${data.id}/${data.action}`,
        },
      ] as BreadCrumbConfig[]);
};
