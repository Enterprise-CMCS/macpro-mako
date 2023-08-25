import { ExportToCsv } from "export-to-csv";
import { getAllSearchData } from "@/api";
import { Button } from "@/components/Button";
import { Download, Loader } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { OsFilterable, OsMainSourceItem } from "shared-types";
import { convertCamelCaseToWords, isISOString } from "@/utils";
import { getStatus } from "@/pages/dashboard/Lists/statusHelper";
import { useGetUser } from "@/api/useGetUser";

type Props = {
  type: "waiver" | "spa";
  filter: OsFilterable;
};

function formatDataForExport(obj: OsMainSourceItem, isCms?: boolean): any {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const k = convertCamelCaseToWords(key);
    if (value === null || value === undefined) {
      result[k] = "";
    } else if (typeof value === "object" && !Array.isArray(value)) {
      result[k] = formatDataForExport(value, isCms);
    } else if (typeof value === "string" && isISOString(value)) {
      result[k] = format(new Date(value), "MM/dd/yyyy");
    } else if (typeof value === "string" && key === "status") {
      result[k] = getStatus(value, isCms);
    } else {
      result[k] = value;
    }
  }

  return result;
}

export const ExportButton = ({ type, filter }: Props) => {
  const [loading, setLoading] = useState(false);
  const { data: user } = useGetUser();

  const handleExport = async () => {
    const csvExporter = new ExportToCsv({
      useKeysAsHeaders: true,
      filename: `${type}-export-${format(new Date(), "MM/dd/yyyy")}`,
    });
    setLoading(true);

    const osData = await getAllSearchData([filter]);
    const sourceItems = osData.map((hit) => {
      const filteredHit = formatDataForExport({ ...hit._source }, user?.isCms);

      // Properties to exclude from export
      Reflect.deleteProperty(filteredHit, "Attachments");

      return filteredHit;
    });
    csvExporter.generateCsv(sourceItems);

    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleExport}
      disabled={loading}
      className="hover:bg-transparent h-full flex gap-2"
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
      Export
    </Button>
  );
};
