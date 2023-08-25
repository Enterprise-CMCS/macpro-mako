import { useGetUser } from "@/api/useGetUser";
import { ErrorAlert, LoadingSpinner } from "@/components";

import { Pagination } from "@/components/Pagination";
import {
  OsTable,
  OsFiltering,
  OsProvider,
  useOsQuery,
} from "@/components/Opensearch";
import { TABLE_COLUMNS } from "./consts";

export const WaiversList = () => {
  const { data: user } = useGetUser();
  const os = useOsQuery({
    filters: [
      {
        field: "authority.keyword",
        type: "terms",
        value: ["WAIVER"],
        prefix: "must",
      },
    ],
  });

  if (os.error) return <ErrorAlert error={os.error} />;

  const columns = TABLE_COLUMNS({ isCms: user?.isCms });

  return (
    <OsProvider value={os.data?.hits || []}>
      <section className="flex flex-col h-[calc(100vh-250px)]">
        <OsFiltering disabled={os.isLoading} />
        {os.isLoading && <LoadingSpinner />}
        <OsTable columns={columns} queryKey="waivers" />
        <Pagination
          pageNumber={os.state.pagination.number}
          count={os.data?.total?.value || 0}
          pageSize={os.state.pagination.size}
          onPageChange={(number) =>
            os.onSet((s) => ({
              ...s,
              pagination: { ...s.pagination, number },
            }))
          }
          onSizeChange={(size) =>
            os.onSet((s) => ({
              ...s,
              pagination: { number: 0, size },
            }))
          }
        />
      </section>
    </OsProvider>
  );
};
