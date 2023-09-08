import type { OsField, OsFilterable } from "shared-types";

export type OsDrawerFilterable = OsFilterable & { open: boolean };
export type OsFilterComponentType = "multiSelect" | "multiCheck" | "dateRange";
export type OsFilterGroup = {
  label: string;
  field: OsField;
  type: OsFilterComponentType;
};

export { OsField };
