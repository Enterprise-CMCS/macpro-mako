import { FC, useState } from "react";
import { OsFiltering } from "./Filtering";
import { OsTable } from "./Table";
import { Pagination } from "@/components/Pagination";
import { useOsContext } from "./Provider";
import { useOsData, useOsUrl } from "./useOpensearch";
import { OsTableColumn } from "./types";
import { FilterChips } from "./Filtering";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const createLSColumns = (columns: OsTableColumn[]): string[] => {
  const columnsVisible = columns.filter((col) => col.hidden);
  const columnFields = columnsVisible.reduce((acc, curr) => {
    if (curr.field) acc.push(curr.field);
    return acc;
  }, []);
  return columnFields;
};

export const OsMainView: FC<{
  columns: OsTableColumn[];
}> = (props) => {
  const context = useOsContext();
  const url = useOsUrl();
  const osData = useOsData();

  const [localSPAStorageCol, setLocalSPAStorageCol] = useLocalStorage(
    "spaOSColumns",
    createLSColumns(props.columns),
  );

  const [localWaiverStorageCol, setLocalWaiverStorageCol] = useLocalStorage(
    "waiversOSColumns",
    createLSColumns(props.columns),
  );

  const initializeColumns = (columns: OsTableColumn[], hiddenFields: string[]) =>
    columns.map((COL) => ({
      ...COL,
      hidden: hiddenFields.includes(COL.field),
      locked: COL?.locked ?? false,
    }));

  const [spaOSColumns, setSpaOSColumns] = useState(() =>
    initializeColumns(props.columns, localSPAStorageCol),
  );
  const [waiverOSColumns, setWaiverOSColumns] = useState(() =>
    initializeColumns(props.columns, localWaiverStorageCol),
  );

  const onToggle = (field: string) => {
    const isSPA = osData.state.tab === "spas";

    const setLocalStorageCol = isSPA ? setLocalSPAStorageCol : setLocalWaiverStorageCol;
    const setColumns = isSPA ? setSpaOSColumns : setWaiverOSColumns;

    setLocalStorageCol((prev) =>
      prev.includes(field) ? prev.filter((x) => x !== field) : [...prev, field],
    );

    setColumns((prev) =>
      prev.map((col) => (col.field === field ? { ...col, hidden: !col.hidden } : col)),
    );
  };

  return (
    <div className="flex flex-col">
      <div className="w-full my-2 max-w-screen-xl self-center px-4 lg:px-8">
        <OsFiltering
          onToggle={onToggle}
          columns={osData.state.tab === "spas" ? spaOSColumns : waiverOSColumns}
        />
        <FilterChips />
      </div>
      <div className="px-4 lg:px-8">
        <OsTable
          onToggle={onToggle}
          columns={osData.state.tab === "spas" ? spaOSColumns : waiverOSColumns}
        />
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
