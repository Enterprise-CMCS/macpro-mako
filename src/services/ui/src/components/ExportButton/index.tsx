import { ExportToCsv } from "export-to-csv";
import { Button } from "@enterprise-cmcs/macpro-ux-lib";
import { type SearchData } from "shared-types";

const csvExporter = new ExportToCsv({
  useKeysAsHeaders: true,
});

type Props = {
  csvData: SearchData | null;
};

export const ExportButton = ({ csvData }: Props) => {
  const handleExport = () => {
    const sourceItems = csvData?.hits.map((hit) => ({ ...hit._source }));
    csvExporter.generateCsv(sourceItems);
  };

  return <Button className="my-4" onClick={handleExport} buttonText="Export" />;
};
