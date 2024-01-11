import type { opensearch } from "shared-types";

export type OsDrawerFilterable = opensearch.main.Filterable & { open: boolean };
export type OsFilterComponentType = "multiSelect" | "multiCheck" | "dateRange";
export type OsFilterGroup = {
  label: string;
  field: opensearch.main.Field;
  type: OsFilterComponentType;
};

export type OsTab = "waivers" | "spas";

export * from "./Table/types";
