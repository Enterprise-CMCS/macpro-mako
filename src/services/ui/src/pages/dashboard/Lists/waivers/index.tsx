import { useGetUser } from "@/api/useGetUser";
import { ErrorAlert, LoadingSpinner } from "@/components";

import { Pagination } from "@/components/Pagination";
import {
  OsTable,
  OsFiltering,
  useOsContext,
  useOsParams,
} from "@/components/Opensearch";
import { TABLE_COLUMNS } from "./consts";

export const WaiversList = () => {
  const { data: user } = useGetUser();
  const context = useOsContext();
  const params = useOsParams();

  if (context.error) return <ErrorAlert error={context.error} />;

  const columns = TABLE_COLUMNS({ isCms: user?.isCms });

  return (
    <section className="tw-flex tw-flex-col tw-h-[calc(100vh-250px)]">
      <OsFiltering />
      {context.isLoading && <LoadingSpinner />}
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
