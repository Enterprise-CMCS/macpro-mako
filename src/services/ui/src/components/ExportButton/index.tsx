import { ExportToCsv } from "export-to-csv";
import { getAllSearchData } from "@/api";
import { Button } from "@/components/Button";
import { Download, Loader } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useOsParams } from "../Opensearch";

export const OsExportButton = () => {
  const [loading, setLoading] = useState(false);
  const params = useOsParams();

  const handleExport = async () => {
    const csvExporter = new ExportToCsv({
      useKeysAsHeaders: true,
      filename: `${params.state.tab}-export-${format(
        new Date(),
        "MM/dd/yyyy"
      )}`,
    });
    setLoading(true);

    const osData = await getAllSearchData([
      {
        field: "authority.keyword",
        type: "terms",
        value: ["CHIP", "MEDICAID"],
        prefix: "must",
      },
    ]);

    const sourceItems = osData.map((hit) => {
      const filteredHit = { ...hit._source };

      // Properties to exclude from export
      Reflect.deleteProperty(filteredHit, "attachments");

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
