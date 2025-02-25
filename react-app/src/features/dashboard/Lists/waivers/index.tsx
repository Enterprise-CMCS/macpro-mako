import { useOsContext, ErrorAlert, OsMainView, LoadingSpinner } from "@/components";
import { useWaiverTableColumns } from "./consts";

export const WaiversList = () => {
  const context = useOsContext();
  const { columns, isLoading } = useWaiverTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  if (isLoading === true) {
    return <LoadingSpinner />;
  }

  return <OsMainView columns={columns} />;
};
