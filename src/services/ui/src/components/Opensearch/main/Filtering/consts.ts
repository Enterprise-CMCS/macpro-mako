import { opensearch } from "shared-types";
import { OsFilterComponentType, OsTab } from "../types";
import { UserRoles } from "shared-types";
import { BLANK_VALUE } from "@/consts";
import { LABELS } from "@/lib/labels";
import { formatSeatoolDate } from "shared-utils";

type DrawerFilterableGroup = {
  label: string;
  component: OsFilterComponentType;
};
type FilterGroup = Partial<
  Record<
    opensearch.main.Field,
    opensearch.main.Filterable & DrawerFilterableGroup
  >
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
    ...(isCms && {
      initialIntakeNeeded: {
        label: "Initial Intake Needed",
        field: "initialIntakeNeeded",
        component: "boolean",
        prefix: "must",
        type: "match",
        value: null,
      },
    }),
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
    ...(isCms && {
      initialIntakeNeeded: {
        label: "Initial Intake Needed",
        field: "initialIntakeNeeded",
        component: "boolean",
        prefix: "must",
        type: "match",
        value: null,
      },
    }),
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
): opensearch.ExportHeaderOptions<opensearch.main.Document>[] => {
  const idFieldName =
    tab === "spas" ? "SPA ID" : tab === "waivers" ? "Waiver Number" : "";
  const actionField: opensearch.ExportHeaderOptions<opensearch.main.Document>[] =
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
      transform: (data) => {
        const status = (() => {
          if (user?.data?.isCms) {
            if (
              user?.data.user?.["custom:cms-roles"].includes(UserRoles.HELPDESK)
            ) {
              return data.stateStatus;
            }
            return data.cmsStatus;
          } else {
            return data.stateStatus;
          }
        })();

        const subStatusRAI = data.raiWithdrawEnabled
          ? " (Withdraw Formal RAI Response - Enabled)"
          : "";

        const subStatusInitialIntake = data.initialIntakeNeeded
          ? " (Initial Intake Needed)"
          : "";

        return `${status}${subStatusRAI}${subStatusInitialIntake}`;
      },
    },
    {
      name: "Initial Submission",
      transform: (data) =>
        data?.submissionDate
          ? formatSeatoolDate(data.submissionDate)
          : BLANK_VALUE,
    },
    {
      name: "Formal RAI Response",
      transform: (data) => {
        return data.raiReceivedDate && !data.raiWithdrawnDate
          ? formatSeatoolDate(data.raiReceivedDate)
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
