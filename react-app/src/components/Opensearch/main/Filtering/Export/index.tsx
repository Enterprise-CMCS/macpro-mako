import { getMainExportData } from "@/api";
import { Download, Loader } from "lucide-react";
import { ExportToCsv } from "export-to-csv";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import { DEFAULT_FILTERS } from "../../useOpensearch";
import {
  Button,
  OsTableColumn,
  createSearchFilterable,
  useOsUrl,
} from "@/components";
import { FC } from "react";

export const OsExportData: FC<{
  columns: OsTableColumn[];
  disabled?: boolean;
}> = ({ columns, disabled }) => {
  const [loading, setLoading] = useState(false);
  const url = useOsUrl();

  const handleExport = async () => {
    setLoading(true);

    const exportData: Record<any, any>[] = [];
    const filters = [
      ...url.state.filters,
      ...(DEFAULT_FILTERS[url.state.tab]?.filters || []),
      ...createSearchFilterable(url.state.search || ""),
    ];

    const resolvedData = await getMainExportData(filters);

    for (const item of resolvedData) {
      const column: Record<any, any> = {};

      for (const header of columns) {
        if (!header.transform) continue;
        if (header.hidden) continue;
        column[header.label] = header.transform(item);
      }
      exportData.push(column);
    }

    const csvExporter = new ExportToCsv({
      useKeysAsHeaders: true,
      filename: `${url.state.tab}-export-${format(new Date(), "MM/dd/yyyy")}`,
    });

    csvExporter.generateCsv(exportData);

    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading || disabled}
      className="w-full xs:w-fit hover:bg-transparent self-center h-10 flex gap-2"
    >
      {loading && (
        <motion.div
          animate={{ rotate: "360deg" }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <Loader className="w-4 h-4" />
        </motion.div>
      )}
      {!loading && <Download className="w-4 h-4" />}
      <span className="prose-sm">Export</span>
    </Button>
  );
};
