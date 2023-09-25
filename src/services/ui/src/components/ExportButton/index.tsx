import { ExportToCsv } from "export-to-csv";
import { getAllSearchData } from "@/api";
import { Button } from "@/components/Button";
import { Download, Loader } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { type OsHit, type OsMainSourceItem } from "shared-types";
import { convertCamelCaseToWords, isISOString } from "@/utils";
import { useGetUser } from "@/api/useGetUser";
import { DEFAULT_FILTERS, useOsParams } from "../Opensearch";
import { createSearchFilterable } from "../Opensearch/utils";

function getUniqueKeys(data: OsHit<OsMainSourceItem>[] | undefined) {
  const uniqueKeys = new Set<string>();

  data?.forEach((osResult) => {
    for (const [key] of Object.entries(osResult._source)) {
      uniqueKeys.add(key);
    }
  });

  return uniqueKeys;
}

function generateColumnNames(key: string) {
  if (key === "leadAnalystName") {
    return "CPOC Name";
  } else {
    return convertCamelCaseToWords(key);
  }
}

function formatDataForExport(
  obj: Record<string, any>,
  uniqueKeys: Set<string>,
  isCms?: boolean
): any {
  const result: any = {};

  for (const key of uniqueKeys) {
    const value = obj[key];
    const k = generateColumnNames(key);

    if (value === null || !Object.hasOwn(obj, key)) {
      result[k] = "";
    } else if (typeof value === "object" && !Array.isArray(value)) {
      result[k] = formatDataForExport(value, uniqueKeys, isCms);
    } else if (typeof value === "string" && isISOString(value)) {
      result[k] = format(new Date(value), "MM/dd/yyyy");
    } else if (typeof value === "string" && key === "cmsStatus") {
      if (isCms) {
        result["Status"] = value;
      }
    } else if (typeof value === "string" && key === "stateStatus") {
      if (!isCms) {
        result["Status"] = value;
      }
    } else {
      result[k] = value;
    }
  }

  return result;
}

export const OsExportButton = () => {
  const [loading, setLoading] = useState(false);
  const { data: user } = useGetUser();
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

    const filters = DEFAULT_FILTERS[params.state.tab]?.filters ?? [];

    const searchFilter = createSearchFilterable(params.state.search);
    const osData = await getAllSearchData([
      ...params.state.filters,
      ...filters,
      ...searchFilter,
    ]);

    const uniqueKeys = getUniqueKeys(osData);

    const sourceItems = osData?.map((hit) => {
      const filteredHit = formatDataForExport(
        { ...hit._source },
        uniqueKeys,
        user?.isCms
      );

      // Properties to exclude from export
      Reflect.deleteProperty(filteredHit, "Attachments");
      Reflect.deleteProperty(filteredHit, "Rai Responses");
      Reflect.deleteProperty(filteredHit, "Cms Status");
      Reflect.deleteProperty(filteredHit, "State Status");

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
      <p className="prose-sm">Export</p>
    </Button>
  );
};
