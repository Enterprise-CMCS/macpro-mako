import { OsField, OsFilterable } from "shared-types";
import { OsFilterComponentType } from "./types";
import { UserRoles } from "shared-types";

type DrawerFilterableGroup = {
  label: string;
  component: OsFilterComponentType;
};

/**
 * @desc
 * - label: ui label
 * - field: opensearch field property (should match key)
 * - component: filterable component type
 * - prefix: query prefix
 * - type: query type
 * - value: query value
 */
export const FILTER_GROUPS = (
  user?: any
): Partial<Record<OsField, OsFilterable & DrawerFilterableGroup>> => {
  return {
    "state.keyword": {
      label: "State",
      field: "state.keyword",
      component: "multiSelect",
      prefix: "must",
      type: "terms",
      value: [],
    },
    "planType.keyword": {
      label: "Type",
      field: "planType.keyword",
      component: "multiCheck",
      prefix: "must",
      type: "terms",
      value: [],
    },
    "actionType.keyword": {
      label: "Action Type",
      field: "actionType.keyword",
      component: "multiCheck",
      prefix: "must",
      type: "terms",
      value: [],
    },
    [user?.isCms &&
    !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
      ? "cmsStatus.keyword"
      : "stateStatus.keyword"]: {
      label: "Status",
      field:
        user?.isCms &&
        !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
          ? "cmsStatus.keyword"
          : "stateStatus.keyword",
      component: "multiCheck",
      prefix: "must",
      type: "terms",
      value: [],
    },
    submissionDate: {
      label: "Initial Submission",
      field: "submissionDate",
      component: "dateRange",
      prefix: "must",
      type: "range",
      value: { gte: undefined, lte: undefined },
    },
    raiReceivedDate: {
      label: "Formal RAI Response",
      field: "raiReceivedDate",
      component: "dateRange",
      prefix: "must",
      type: "range",
      value: { gte: undefined, lte: undefined },
    },
    "leadAnalystName.keyword": {
      label: "CPOC Name",
      field: "leadAnalystName.keyword",
      component: "multiSelect",
      prefix: "must",
      type: "terms",
      value: [],
    },
  };
};
