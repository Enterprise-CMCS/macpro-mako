import { ROUTES } from "@/routes";

export type BreadCrumbConfig = {
  default?: boolean;
  order: number;
  to: string;
  displayText: string;
};

export const BREAD_CRUMB_CONFIG_PACKAGE_DETAILS = (data: {
  id: string;
}): BreadCrumbConfig[] => [
  {
    displayText: "Dashboard",
    order: 1,
    default: true,
    to: ROUTES.DASHBOARD,
  },
  {
    displayText: `${data.id}`,
    order: 2,
    to: ROUTES.DETAILS,
  },
];
