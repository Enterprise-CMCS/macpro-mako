import { format } from "date-fns";
import { ExportToCsv } from "export-to-csv";
import { opensearch } from "shared-types";

import { OsTableColumn } from "@/components";

type ExportColumn = OsTableColumn & {
  transform: NonNullable<OsTableColumn["transform"]>;
};

export const getExportFilenameBase = (tab: string, date = new Date()) =>
  `${tab}-export-${format(date, "MM_dd_yyyy")}`;

export const getVisibleExportColumns = (columns: OsTableColumn[]): ExportColumn[] =>
  columns.filter((column): column is ExportColumn => Boolean(column.transform) && !column.hidden);

export const buildCsvExportRows = (
  columns: ExportColumn[],
  items: opensearch.main.Document[],
): Record<string, string>[] =>
  items.map((item) =>
    columns.reduce<Record<string, string>>((acc, column) => {
      acc[column.label] = column.transform(item);
      return acc;
    }, {}),
  );

export const exportCsvRows = (rows: Record<string, string>[], filenameBase: string) => {
  const csvExporter = new ExportToCsv({
    useKeysAsHeaders: true,
    filename: filenameBase,
  });

  csvExporter.generateCsv(rows);
};
