import { OsField, OsFilterable } from "shared-types";
import { OsFilterComponentType } from "./types";

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
export const FILTER_GROUPS: {
  [Key in OsField]?: OsFilterable & DrawerFilterableGroup;
} = {
  "state.keyword": {
    label: "States",
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
  "status.keyword": {
    label: "Status",
    field: "status.keyword",
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
