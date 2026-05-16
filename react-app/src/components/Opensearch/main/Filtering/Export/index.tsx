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
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import {
  DEFAULT_FILTERS,
  getSaveInProgressDashboardFilters,
  removeDraftStatusFilters,
} from "../../useOpensearch";
import {
  buildCsvExportRows,
  exportCsvRows,
  getExportFilenameBase,
  getVisibleExportColumns,
} from "./export.utils";

const EXPORT_LIMIT = 10000;

export const OsExportData: FC<{
  columns: OsTableColumn[];
  disabled?: boolean;
  count: number;
}> = ({ columns, disabled, count }) => {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const url = useOsUrl();
  const isSaveInProgressEnabled = useFeatureFlag("SAVE_IN_PROGRESS");

  const exportToCsv = async () => {
    setLoading(true);
    const filters = [
      ...(isSaveInProgressEnabled
        ? url.state.filters
        : removeDraftStatusFilters(url.state.filters)),
      ...(DEFAULT_FILTERS[url.state.tab]?.filters || []),
      ...createSearchFilterable(url.state.search || ""),
      ...getSaveInProgressDashboardFilters(isSaveInProgressEnabled),
    ];

    const resolvedData = await getMainExportData(filters, url.state.sort, {
      includeDrafts: isSaveInProgressEnabled,
    });
    const visibleColumns = getVisibleExportColumns(columns);
    const filenameBase = getExportFilenameBase(url.state.tab);
    const exportRows = buildCsvExportRows(visibleColumns, resolvedData);
    exportCsvRows(exportRows, filenameBase);

    sendGAEvent("dash_export_csv", {
      row_count: resolvedData.length,
    });
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
