import { ErrorAlert, LoadingSpinner } from "@/components";
import { Pagination } from "@/components/Pagination";

import {
  OsTable,
  OsFiltering,
  useOsContext,
  useOsParams,
} from "@/components/Opensearch";
import { useSpaTableColumns } from "./consts";

export const SpasList = () => {
  const context = useOsContext();
  const params = useOsParams();
  const columns = useSpaTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  return (
    <section className="flex flex-col h-[calc(100vh-230px)]">
      <OsFiltering />
      <OsTable columns={columns} />
      <Pagination
        pageNumber={params.state.pagination.number}
        count={context.data?.total?.value || 0}
        pageSize={params.state.pagination.size}
        onPageChange={(number) =>
          params.onSet((s) => ({
            ...s,
            pagination: { ...s.pagination, number },
          }))
        }
        onSizeChange={(size) =>
          params.onSet((s) => ({
            ...s,
            pagination: { number: 0, size },
          }))
        }
      />
    </section>
  );
};
