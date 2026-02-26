import { format } from "date-fns";
import { ExportToCsv } from "export-to-csv";
import { opensearch, SEATOOL_STATUS } from "shared-types";

import { OsTableColumn } from "@/components";

type ExportColumn = OsTableColumn & {
  transform: NonNullable<OsTableColumn["transform"]>;
};

export type StyledExportRow = {
  isDraft: boolean;
  values: string[];
};

export const getExportFilenameBase = (tab: string, date = new Date()) =>
  `${tab}-export-${format(date, "MM_dd_yyyy")}`;

const triggerBlobDownload = (blob: Blob, filename: string) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!window.URL || typeof window.URL.createObjectURL !== "function") return;

  const link = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

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

export const buildStyledExportRows = (
  columns: ExportColumn[],
  items: opensearch.main.Document[],
): StyledExportRow[] =>
  items.map((item) => ({
    isDraft: item.seatoolStatus === SEATOOL_STATUS.DRAFT,
    values: columns.map((column) => column.transform(item)),
  }));

export const exportCsvRows = (rows: Record<string, string>[], filenameBase: string) => {
  const csvExporter = new ExportToCsv({
    useKeysAsHeaders: true,
    filename: filenameBase,
  });

  csvExporter.generateCsv(rows);
};

export const exportStyledExcelRows = async (
  columns: ExportColumn[],
  rows: StyledExportRow[],
  filenameBase: string,
) => {
  const excelJs = await import("exceljs");
  const workbook = new excelJs.Workbook();
  const worksheet = workbook.addWorksheet("Dashboard");

  const headerRow = worksheet.addRow(columns.map((column) => column.label));
  headerRow.font = { bold: true };

  rows.forEach((row) => {
    const sheetRow = worksheet.addRow(row.values);
    if (row.isDraft) {
      sheetRow.font = { italic: true };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  triggerBlobDownload(blob, `${filenameBase}.xlsx`);
};
