import type { ReactNode } from "react";
import type { opensearch } from "shared-types";

export type OsTableColumn = {
  field?: opensearch.main.Field;
  label: string;
  locked?: boolean;
  hidden?: boolean;
  isSystem?: boolean;
  props?: any;
  transform?: (data: opensearch.main.Document) => string;
  cell: (data: opensearch.main.Document) => ReactNode;
};
