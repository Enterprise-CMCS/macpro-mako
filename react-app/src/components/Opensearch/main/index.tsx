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
  const columnsVisalbe = columns.filter((col) => col.hidden);
  const columnFields = columnsVisalbe.reduce((acc, curr) => {
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

  const [spaOSColumns, setSpaOSColumns] = useState(
    props.columns.map((COL) => ({
      ...COL,
      hidden: localSPAStorageCol.includes(COL.field),
      locked: COL?.locked ?? false,
    })),
  );

  const [waiverOSColumns, setWaiverOSColumns] = useState(
    props.columns.map((COL) => ({
      ...COL,
      hidden: localWaiverStorageCol.includes(COL.field),
      locked: COL?.locked ?? false,
    })),
  );

  const onToggle = (field: string) => {
    if (osData.state.tab === "spas") {
      if (localSPAStorageCol.includes(field))
        setLocalSPAStorageCol(() => localSPAStorageCol.filter((x) => x != field));
      else setLocalSPAStorageCol([...localSPAStorageCol, field]);

      setSpaOSColumns((state) => {
        return state?.map((S) => {
          if (S.field !== field) return S;
          return { ...S, hidden: !S.hidden };
        });
      });
    } else {
      if (localWaiverStorageCol.includes(field))
        setLocalWaiverStorageCol(() => localWaiverStorageCol.filter((x) => x != field));
      else setLocalWaiverStorageCol([...localWaiverStorageCol, field]);

      setWaiverOSColumns((state) => {
        return state?.map((S) => {
          if (S.field !== field) return S;
          return { ...S, hidden: !S.hidden };
        });
      });
    }

    console.log(osData.state.tab);
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
