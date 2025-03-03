import { useOsContext, ErrorAlert, OsMainView, LoadingSpinner } from "@/components";
import { useSpaTableColumns } from "./consts";

export const SpasList = () => {
  const context = useOsContext();
  const { columns, isLoading } = useSpaTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  if (isLoading === true) {
    return <LoadingSpinner />;
  }

  return <OsMainView columns={columns} />;
};
