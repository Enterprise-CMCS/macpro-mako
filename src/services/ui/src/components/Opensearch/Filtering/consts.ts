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
type FilterGroup = Partial<
  Record<OsField, OsFilterable & DrawerFilterableGroup>
>;

const SPA_FILTER_GROUP = (isCms: boolean): FilterGroup => {
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
    [isCms ? "cmsStatus.keyword" : "stateStatus.keyword"]: {
      label: "Status",
      field: isCms ? "cmsStatus.keyword" : "stateStatus.keyword",
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
    "origin.keyword": {
      label: "Submission Source",
      field: "origin.keyword",
      component: "multiSelect",
      prefix: "must",
      type: "terms",
      value: [],
    },
  };
};

const WAIVER_FILTER_GROUP = (isCms: boolean): FilterGroup => {
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
    [isCms ? "cmsStatus.keyword" : "stateStatus.keyword"]: {
      label: "Status",
      field: isCms ? "cmsStatus.keyword" : "stateStatus.keyword",
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
    "origin.keyword": {
      label: "Submission Source",
      field: "origin.keyword",
      component: "multiSelect",
      prefix: "must",
      type: "terms",
      value: [],
    },
  };
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
export const FILTER_GROUPS = (user?: any, tab?: OsTab): FilterGroup => {
  const isCms =
    !!user?.isCms &&
    !user.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK);

  switch (tab) {
    case "spas":
      return SPA_FILTER_GROUP(isCms);
    case "waivers":
    default:
      return WAIVER_FILTER_GROUP(isCms);
  }
};

// Export headers dependent on tab
export const EXPORT_GROUPS = (
  tab: OsTab,
  user?: any
): OsExportHeaderOptions<OsMainSourceItem>[] => {
  const idFieldName =
    tab === "spas" ? "SPA ID" : tab === "waivers" ? "Waiver Number" : "";
  const actionField: OsExportHeaderOptions<OsMainSourceItem>[] =
    tab === "waivers"
      ? [
          {
            name: "Action Type",
            transform: (data) => {
              if (data.actionType === undefined) {
                return BLANK_VALUE;
              }

              return (
                LABELS[data.actionType as keyof typeof LABELS] ||
                data.actionType
              );
            },
          },
        ]
      : [];

  return [
    {
      name: idFieldName,
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
    ...actionField,
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
        return data.raiReceivedDate && !data.raiWithdrawnDate
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
