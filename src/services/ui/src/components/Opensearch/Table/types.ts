import type { OsField, OsHit, OsMainSourceItem } from "shared-types";
import type { ReactNode } from "react";

export type OsTableColumn = {
  field: OsField;
  label: string;
  props?: any;
  cell: (data: OsHit<OsMainSourceItem>["_source"]) => ReactNode;
};
