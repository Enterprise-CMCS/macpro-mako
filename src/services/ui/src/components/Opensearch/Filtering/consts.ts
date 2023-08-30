import { OsField, OsFilterable } from "shared-types";
import { OsFilterComponentType } from "./types";

type DrawerFilterableGroup = {
  label: string;
  component: OsFilterComponentType;
};

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
  raiReceivedDate: {
    label: "Rai Received At",
    field: "raiReceivedDate",
    component: "dateRange",
    prefix: "must",
    type: "range",
    value: { gte: undefined, lte: undefined },
  },
};

export const MOCK = {
  aggregations: {
    "state.keyword": {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [
        {
          key: "MD",
          doc_count: 3472,
        },
        {
          key: "AK",
          doc_count: 666,
        },
        {
          key: "NY",
          doc_count: 415,
        },
        {
          key: "TX",
          doc_count: 385,
        },
        {
          key: "LA",
          doc_count: 339,
        },
        {
          key: "CO",
          doc_count: 285,
        },
        {
          key: "VA",
          doc_count: 282,
        },
        {
          key: "MI",
          doc_count: 266,
        },
        {
          key: "NC",
          doc_count: 248,
        },
        {
          key: "MT",
          doc_count: 225,
        },
        {
          key: "MA",
          doc_count: 223,
        },
        {
          key: "CA",
          doc_count: 217,
        },
        {
          key: "CT",
          doc_count: 215,
        },
        {
          key: "PA",
          doc_count: 211,
        },
        {
          key: "WA",
          doc_count: 192,
        },
        {
          key: "MN",
          doc_count: 189,
        },
        {
          key: "OH",
          doc_count: 173,
        },
        {
          key: "IA",
          doc_count: 164,
        },
        {
          key: "UT",
          doc_count: 160,
        },
        {
          key: "WI",
          doc_count: 155,
        },
        {
          key: "IL",
          doc_count: 152,
        },
        {
          key: "PR",
          doc_count: 149,
        },
        {
          key: "SC",
          doc_count: 142,
        },
        {
          key: "ID",
          doc_count: 136,
        },
        {
          key: "NE",
          doc_count: 136,
        },
        {
          key: "OR",
          doc_count: 136,
        },
        {
          key: "AL",
          doc_count: 133,
        },
        {
          key: "FL",
          doc_count: 133,
        },
        {
          key: "ND",
          doc_count: 133,
        },
        {
          key: "HI",
          doc_count: 132,
        },
        {
          key: "ME",
          doc_count: 130,
        },
        {
          key: "AR",
          doc_count: 129,
        },
        {
          key: "OK",
          doc_count: 125,
        },
        {
          key: "DC",
          doc_count: 123,
        },
        {
          key: "AZ",
          doc_count: 122,
        },
        {
          key: "DE",
          doc_count: 120,
        },
        {
          key: "VI",
          doc_count: 115,
        },
        {
          key: "VT",
          doc_count: 115,
        },
        {
          key: "WY",
          doc_count: 114,
        },
        {
          key: "IN",
          doc_count: 111,
        },
        {
          key: "GU",
          doc_count: 107,
        },
        {
          key: "MS",
          doc_count: 107,
        },
        {
          key: "KY",
          doc_count: 103,
        },
        {
          key: "NV",
          doc_count: 103,
        },
        {
          key: "NJ",
          doc_count: 100,
        },
        {
          key: "KS",
          doc_count: 95,
        },
        {
          key: "MO",
          doc_count: 95,
        },
        {
          key: "NH",
          doc_count: 90,
        },
        {
          key: "GA",
          doc_count: 86,
        },
        {
          key: "SD",
          doc_count: 78,
        },
        {
          key: "RI",
          doc_count: 75,
        },
        {
          key: "WV",
          doc_count: 75,
        },
        {
          key: "NM",
          doc_count: 68,
        },
        {
          key: "TN",
          doc_count: 49,
        },
        {
          key: "AS",
          doc_count: 38,
        },
        {
          key: "MP",
          doc_count: 10,
        },
      ],
    },
    "planType.keyword": {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [
        {
          key: "Medicaid SPA",
          doc_count: 10669,
        },
        {
          key: "CHIP SPA",
          doc_count: 1678,
        },
      ],
    },
    "status.keyword": {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [
        {
          key: "Approved",
          doc_count: 6062,
        },
        {
          key: "Pending",
          doc_count: 4996,
        },
        {
          key: "Withdrawn",
          doc_count: 498,
        },
        {
          key: "Pending-RAI",
          doc_count: 474,
        },
        {
          key: "Pending-Concurrence",
          doc_count: 262,
        },
        {
          key: "Disapproved",
          doc_count: 42,
        },
        {
          key: "Terminated",
          doc_count: 3,
        },
      ],
    },
  },
} as const;
