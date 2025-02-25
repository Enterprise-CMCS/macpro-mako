import { FC, useState } from "react";
import { OsFiltering } from "./Filtering";
import { OsTable } from "./Table";
import { Pagination } from "@/components/Pagination";
import { useOsContext } from "./Provider";
import { useOsData, useOsUrl } from "./useOpensearch";
import { OsTableColumn } from "./types";
import { FilterChips } from "./Filtering";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const createLSColumns = (columns: OsTableColumn[]): string[] =>
  columns.filter((col) => col.hidden).map((col) => col.field ?? "");

export const OsMainView: FC<{ columns: OsTableColumn[] }> = (props) => {
  const context = useOsContext();
  const url = useOsUrl();
  const osData = useOsData();
  const currentTab = osData.state.tab;

  const [localStorageCol, setLocalStorageCol] = useLocalStorage("osColumns", {
    spas: createLSColumns(props.columns),
    waivers: createLSColumns(props.columns),
  });

  const initializeColumns = (columns: OsTableColumn[], hiddenFields: string[] = []) =>
    columns.map((col) => ({
      ...col,
      hidden: hiddenFields.includes(col.field),
      locked: col.locked ?? false,
    }));

  const [osColumns, setOsColumns] = useState(() => ({
    spas: initializeColumns(props.columns, localStorageCol.spas),
    waivers: initializeColumns(props.columns, localStorageCol.waivers),
  }));

  const onToggle = (field: string) => {
    setLocalStorageCol((prev) => ({
      ...prev,
      [currentTab]: prev[currentTab].includes(field)
        ? prev[currentTab].filter((x) => x !== field)
        : [...prev[currentTab], field],
    }));

    setOsColumns((prev) => ({
      ...prev,
      [currentTab]: prev[currentTab].map((col) =>
        col.field === field ? { ...col, hidden: !col.hidden } : col,
      ),
    }));
  };

  return (
    <div className="flex flex-col">
      <div className="w-full my-2 max-w-screen-xl self-center px-4 lg:px-8">
        <OsFiltering onToggle={onToggle} columns={osColumns[currentTab]} />
        <FilterChips />
      </div>
      <div className="px-4 lg:px-8">
        <OsTable onToggle={onToggle} columns={osColumns[currentTab]} />
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
