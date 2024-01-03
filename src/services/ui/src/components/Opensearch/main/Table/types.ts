import type { MainField, MainDocument } from "shared-types";
import type { ReactNode } from "react";

export type OsTableColumn = {
  field?: MainField;
  label: string;
  visible?: boolean;
  locked?: boolean;
  isSystem?: boolean;
  props?: any;
  cell: (data: MainDocument) => ReactNode;
};
