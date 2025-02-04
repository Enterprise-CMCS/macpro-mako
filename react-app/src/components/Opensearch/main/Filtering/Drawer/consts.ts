import { opensearch } from "shared-types";
import { OsFilterComponentType } from "../../types";

/**
 * @desc
 * - label: ui label
 * - field: opensearch field property (should match key)
 * - component: filterable component type
 * - prefix: query prefix
 * - type: query type
 * - value: query value
 */
export type DrawerFilterableGroup = {
  label: string;
  component: OsFilterComponentType;
} & opensearch.main.Filterable;

export const SELECT_STATE: DrawerFilterableGroup = {
  label: "State",
  field: "state.keyword",
  component: "multiSelect",
  prefix: "must",
  type: "terms",
  value: [],
};

export const CHECK_AUTHORITY: DrawerFilterableGroup = {
  label: "Authority",
  field: "authority.keyword",
  component: "multiCheck",
  prefix: "must",
  type: "terms",
  value: [],
};

export const CHECK_CMSSTATUS: DrawerFilterableGroup = {
  label: "Status",
  field: "cmsStatus.keyword",
  component: "multiCheck",
  prefix: "must",
  type: "terms",
  value: [],
};

export const CHECK_STATESTATUS: DrawerFilterableGroup = {
  label: "Status",
  field: "stateStatus.keyword",
  component: "multiCheck",
  prefix: "must",
  type: "terms",
  value: [],
};

export const BOOL_RAIWITHDRAWENABLED: DrawerFilterableGroup = {
  label: "RAI Withdraw Enabled",
  field: "raiWithdrawEnabled",
  component: "boolean",
  prefix: "must",
  type: "match",
  value: null,
};

export const CHECK_ACTIONTYPE: DrawerFilterableGroup = {
  label: "Action Type",
  field: "actionType.keyword",
  component: "multiCheck",
  prefix: "must",
  type: "terms",
  value: [],
};

export const DATE_INITIALSUBMISSION: DrawerFilterableGroup = {
  label: "Initial Submission",
  field: "submissionDate",
  component: "dateRange",
  prefix: "must",
  type: "range",
  value: { gte: undefined, lte: undefined },
};

export const DATE_FINALDISPOSITION: DrawerFilterableGroup = {
  label: "Final Disposition",
  field: "finalDispositionDate",
  component: "dateRange",
  prefix: "must",
  type: "range",
  value: { gte: undefined, lte: undefined },
};

export const DATE_LATESTPACKAGEACTIVITY: DrawerFilterableGroup = {
  label: "Latest Package Activity",
  field: "makoChangedDate",
  component: "dateRange",
  prefix: "must",
  type: "range",
  value: { gte: undefined, lte: undefined },
};

export const DATE_RAIRECEIVED: DrawerFilterableGroup = {
  label: "Formal RAI Response",
  field: "raiReceivedDate",
  component: "dateRange",
  prefix: "must",
  type: "range",
  value: { gte: undefined, lte: undefined },
};

export const SELECT_CPOC: DrawerFilterableGroup = {
  label: "CPOC Name",
  field: "leadAnalystName.keyword",
  component: "multiSelect",
  prefix: "must",
  type: "terms",
  value: [],
};

export const SELECT_ORIGIN: DrawerFilterableGroup = {
  label: "Submission Source",
  field: "origin.keyword",
  component: "multiSelect",
  prefix: "must",
  type: "terms",
  value: [],
};
