import type { MainFilterable, MainField } from "shared-types";

export type OsDrawerFilterable = MainFilterable & { open: boolean };
export type OsFilterComponentType = "multiSelect" | "multiCheck" | "dateRange";
export type OsFilterGroup = {
  label: string;
  field: MainField;
  type: OsFilterComponentType;
};

export type OsTab = "waivers" | "spas";

export { MainField };
export * from "./Table/types";
