import { ErrorAlert } from "@/components";
import { Pagination } from "@/components/Pagination";

import {
  OsTable,
  OsFiltering,
  useOsContext,
  useOsUrl,
} from "@/components/Opensearch/main";
import { useSpaTableColumns } from "./consts";

export const SpasList = () => {
  const context = useOsContext();
  const url = useOsUrl();
  const columns = useSpaTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  return (
    <section className="flex flex-col h-[calc(100vh-230px)]">
      <OsFiltering />
      <OsTable columns={columns} />
      <Pagination
        pageNumber={url.state.pagination.number}
        count={context.data?.total?.value || 0}
        pageSize={url.state.pagination.size}
        onPageChange={(number) =>
          url.onSet((s) => ({
            ...s,
            pagination: { ...s.pagination, number },
          }))
        }
        onSizeChange={(size) =>
          url.onSet((s) => ({
            ...s,
            pagination: { number: 0, size },
          }))
        }
      />
    </section>
  );
};
