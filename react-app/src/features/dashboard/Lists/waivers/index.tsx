import { useWaiverTableColumns } from "./consts";

import { ErrorAlert, LoadingSpinner, OsMainView, useOsContext } from "@/components";

export const WaiversList = () => {
  const context = useOsContext();
  const { columns, isLoading } = useWaiverTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  if (isLoading === true) {
    return <LoadingSpinner />;
  }

  return <OsMainView columns={columns} />;
};
