import { ExportButton } from "@/components";
import { useFilterExportGroups } from "./hooks";

export const OsFilterExport = () => {
  const hook = useFilterExportGroups();

  return <ExportButton data={hook.onExport} headers={hook.headers} />;
};

export * from "./hooks";
