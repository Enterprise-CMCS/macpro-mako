import { getMainExportData } from "@/api";
import { Download, Loader } from "lucide-react";
import { ExportToCsv } from "export-to-csv";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import { DEFAULT_FILTERS } from "../../useOpensearch";
import { Button, OsTableColumn, useOsUrl } from "@/components";
import { FC } from "react";

export const OsExportData: FC<{
  columns: OsTableColumn[];
}> = ({ columns }) => {
  const [loading, setLoading] = useState(false);
  const url = useOsUrl();

  const generateExport = async (): Promise<Record<any, any>> => {
    setLoading(true);

    const exportData: Record<any, any>[] = [];
    const resolvedData = await getMainExportData(
      url.state.filters.concat(DEFAULT_FILTERS[url.state.tab]?.filters ?? [])
    );

    for (const item of resolvedData) {
      const column: Record<any, any> = {};

      for (const header of columns) {
        if (!header.transform) continue;
        if (header.hidden) continue;
        column[header.label] = header.transform(item);
      }
      exportData.push(column);
    }

    setLoading(false);

    return exportData;
  };

  const handleExport = (data: Record<any, any>) => {
    const csvExporter = new ExportToCsv({
      useKeysAsHeaders: true,
      filename: `${url.state.tab}-export-${format(new Date(), "MM/dd/yyyy")}`,
    });

    csvExporter.generateCsv(data);
  };

  return (
    <Button
      variant="outline"
      onClick={async () => {
        handleExport(await generateExport());
      }}
      disabled={loading}
      className="hover:bg-transparent self-center h-10 flex gap-2"
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
