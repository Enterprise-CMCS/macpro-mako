import {
  OsExportHeaderOptions,
  OsField,
  OsFilterable,
  OsMainSourceItem,
} from "shared-types";
import { OsFilterComponentType, OsTab } from "../types";
import { UserRoles } from "shared-types";
import { BLANK_VALUE } from "@/consts";
import { LABELS } from "@/lib/labels";
import { format } from "date-fns";

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
      label: "Plan Type",
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
      label: "RAI Response Date",
      field: "raiReceivedDate",
      component: "dateRange",
      prefix: "must",
      type: "range",
      value: { gte: undefined, lte: undefined },
    },
    "leadAnalystName.keyword": {
      label: "CPOC",
      field: "leadAnalystName.keyword",
      component: "multiSelect",
      prefix: "must",
      type: "terms",
      value: [],
    },
  };
};

export const EXPORT_GROUPS = (
  tab: OsTab,
  user?: any
): OsExportHeaderOptions<OsMainSourceItem>[] => {
  return [
    {
      name: (() => {
        if (tab === "spas") {
          return "SPA ID";
        } else if (tab === "waivers") {
          return "Waiver Number";
        }
        return "";
      })(),
      transform: (data) => data.id,
    },
    {
      name: "State",
      transform: (data) => data.state ?? BLANK_VALUE,
    },
    {
      name: "Type",
      transform: (data) => data.planType ?? BLANK_VALUE,
    },
    {
      name: "Action Type",
      transform: (data) => {
        if (data.actionType === undefined) {
          return BLANK_VALUE;
        }

        return (
          LABELS[data.actionType as keyof typeof LABELS] || data.actionType
        );
      },
    },
    {
      name: "Status",
      transform(data) {
        if (user?.data?.isCms && !user?.data?.user) {
          if (data.cmsStatus) {
            return data.cmsStatus;
          }
          return BLANK_VALUE;
        } else {
          if (data.stateStatus) {
            return data.stateStatus;
          }
          return BLANK_VALUE;
        }
      },
    },
    {
      name: "Initial Submission",
      transform: (data) =>
        data?.submissionDate
          ? format(new Date(data.submissionDate), "MM/dd/yyyy")
          : BLANK_VALUE,
    },
    {
      name: "Formal RAI Response",
      transform: (data) => {
        return data.raiReceivedDate
          ? format(new Date(data.raiReceivedDate), "MM/dd/yyyy")
          : BLANK_VALUE;
      },
    },
    {
      name: "CPOC Name",
      transform: (data) => data.leadAnalystName ?? BLANK_VALUE,
    },
    {
      name: "Submitted By",
      transform: (data) => data.submitterName ?? BLANK_VALUE,
    },
  ];
};
