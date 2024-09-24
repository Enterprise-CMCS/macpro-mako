import { FC, useState } from "react";
import { OsFiltering } from "./Filtering";
import { OsTable } from "./Table";
import { Pagination } from "@/components/Pagination";
import { useOsContext } from "./Provider";
import { useOsUrl } from "./useOpensearch";
import { OsTableColumn } from "./types";
import { FilterChips } from "./Filtering";

export const OsMainView: FC<{
  columns: OsTableColumn[];
}> = (props) => {
  const context = useOsContext();
  const url = useOsUrl();

  const [osColumns, setOsColumns] = useState(
    props.columns.map((COL) => ({
      ...COL,
      hidden: !!COL?.hidden,
      locked: COL?.locked ?? false,
    })),
  );

  const onToggle = (field: string) => {
    setOsColumns((state) => {
      return state?.map((S) => {
        if (S.field !== field) return S;
        return { ...S, hidden: !S.hidden };
      });
    });
  };

  return (
    <div className="flex flex-col">
      <div className="w-full my-2 max-w-screen-xl self-center px-4 lg:px-8">
        <OsFiltering onToggle={onToggle} columns={osColumns} />
        <FilterChips />
      </div>
      <div className="px-4 lg:px-8">
        <OsTable onToggle={onToggle} columns={osColumns} />
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
      </div>
    </div>
  );
};

export * from "./useOpensearch";
export * from "./types";
export * from "./Table";
export * from "./Filtering";
export * from "./Provider";
export * from "./Settings";
