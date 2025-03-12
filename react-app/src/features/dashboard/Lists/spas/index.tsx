import { useSpaTableColumns } from "./consts";

import { ErrorAlert, LoadingSpinner, OsMainView, useOsContext } from "@/components";

export const SpasList = () => {
  const context = useOsContext();
  const { columns, isLoading } = useSpaTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  if (isLoading === true) {
    return <LoadingSpinner />;
  }

  return <OsMainView columns={columns} />;
};
