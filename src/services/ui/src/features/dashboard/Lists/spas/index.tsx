import { useOsContext, ErrorAlert, OsMainView } from "@/components";
import { useSpaTableColumns } from "./consts";

export const SpasList = () => {
  const context = useOsContext();
  const columns = useSpaTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  return <OsMainView columns={columns} />;
};
