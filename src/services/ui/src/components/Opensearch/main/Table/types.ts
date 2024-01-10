import type { opensearch } from "shared-types";
import type { ReactNode } from "react";

export type OsTableColumn = {
  field?: opensearch.main.Field;
  label: string;
  visible?: boolean;
  locked?: boolean;
  isSystem?: boolean;
  props?: any;
  cell: (data: opensearch.main.Document) => ReactNode;
};
