import {
  OsTable,
  OsFiltering,
  useOsContext,
  useOsUrl,
  Pagination,
  ErrorAlert,
} from "@/components";
import { useWaiverTableColumns } from "./consts";

export const WaiversList = () => {
  const context = useOsContext();
  const url = useOsUrl();
  const columns = useWaiverTableColumns();

  if (context.error) return <ErrorAlert error={context.error} />;

  return (
    <section className="flex flex-col h-[100vh]">
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
