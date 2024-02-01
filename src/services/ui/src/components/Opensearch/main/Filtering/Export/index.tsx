import { ExportButton } from "@/components/ExportButton";
import { useFilterExportGroups } from "./hooks";

export const OsFilterExport = () => {
  const hook = useFilterExportGroups();

  return <ExportButton data={hook.onExport} headers={hook.headers} />;
};
