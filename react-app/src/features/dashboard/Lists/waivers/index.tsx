import { useOsContext, ErrorAlert, OsMainView } from "@/components";
import { useWaiverTableColumns } from "./consts";

export const WaiversList = () => {
  const context = useOsContext();
  const columns = useWaiverTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  return <OsMainView columns={columns} />;
};
