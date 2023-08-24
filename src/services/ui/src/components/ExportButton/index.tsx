import { ExportToCsv } from "export-to-csv";
import { Button } from "@enterprise-cmcs/macpro-ux-lib";
import { type SearchData } from "shared-types";

const csvExporter = new ExportToCsv({
  useKeysAsHeaders: true,
  filename: "dashboard-view-export",
});

type Props = {
  csvData: SearchData | null;
};

export const ExportButton = ({ csvData }: Props) => {
  const handleExport = () => {
    if (csvData) {
      const sourceItems = csvData.hits.map((hit) => {
        const filteredHit = { ...hit._source };

        // Properties to exclude from export
        Reflect.deleteProperty(filteredHit, "attachments");

        return filteredHit;
      });
      csvExporter.generateCsv(sourceItems);
    }
  };

  return <Button className="my-4" onClick={handleExport} buttonText="Export" />;
};
