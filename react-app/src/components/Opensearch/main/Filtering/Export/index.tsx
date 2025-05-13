import { format } from "date-fns";
import { ExportToCsv } from "export-to-csv";
import { motion } from "framer-motion";
import { Download, Loader } from "lucide-react";
import { useState } from "react";
import { FC } from "react";

import { getMainExportData } from "@/api";
import {
  Button,
  createSearchFilterable,
  OsTableColumn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useOsUrl,
} from "@/components";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

import { DEFAULT_FILTERS } from "../../useOpensearch";

const EXPORT_LIMIT = 10000;

export const OsExportData: FC<{
  columns: OsTableColumn[];
  disabled?: boolean;
  count: number;
}> = ({ columns, disabled, count }) => {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const url = useOsUrl();

  const exportToCsv = async () => {
    setLoading(true);
    const exportData: Record<any, any>[] = [];
    const filters = [
      ...url.state.filters,
      ...(DEFAULT_FILTERS[url.state.tab]?.filters || []),
      ...createSearchFilterable(url.state.search || ""),
    ];

    const resolvedData = await getMainExportData(filters, url.state.sort);

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

  const handleExport = async () => {
    if (disabled) {
      return;
    }

    if (count > EXPORT_LIMIT) {
      setShowAlert(true);
      return;
    }

    await exportToCsv();
  };

  return (
    <>
      <ConfirmationDialog
        open={showAlert}
        title="Export limit reached"
        body="Only the first 10,000 records can be exported. Try filtering to get fewer results."
        acceptButtonText="Export"
        aria-labelledby="Export limit confirmation dialog."
        onAccept={() => {
          setShowAlert(false);
          exportToCsv();
        }}
        onCancel={() => setShowAlert(false)}
      />
      <TooltipProvider>
        <Tooltip disableHoverableContent={true}>
          <TooltipTrigger asChild className="disabled:pointer-events-auto">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={loading || disabled}
              className="w-full xs:w-fit hover:bg-transparent self-center h-10 flex gap-2"
              data-testid="export-csv-btn"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: "360deg" }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Loader className="w-4 h-4" />
                </motion.div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="prose-sm">Export</span>
            </Button>
          </TooltipTrigger>
          {disabled && (
            <TooltipContent data-testid="tooltip-content">No records available</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
