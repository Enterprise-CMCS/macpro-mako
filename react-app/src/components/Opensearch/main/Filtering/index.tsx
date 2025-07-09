import { FC, useEffect, useRef, useState } from "react";

import { OsTableColumn, SearchForm } from "@/components";
import { VisibilityPopover } from "@/components";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { useOsContext } from "../Provider";
import { useOsUrl } from "../useOpensearch";
import { OsFilterDrawer } from "./Drawer";
import { OsExportData } from "./Export";
export const OsFiltering: FC<{
  columns: OsTableColumn[];
  onToggle: (field: string) => void;
  disabled?: boolean;
  count?: number;
}> = ({ columns, onToggle, disabled, count }) => {
  const url = useOsUrl();
  const context = useOsContext();
  const [lastSearch, setLastSearch] = useState<string | null>(null);
  const wasLoading = useRef(false);

  useEffect(() => {
    // When a search completes and we have a stored query
    if (wasLoading.current && !context.isLoading && lastSearch) {
      sendGAEvent("dash_search", {
        query_short: lastSearch.slice(0, 3),
        result_count: count ?? 0,
      });
      wasLoading.current = false;
      setLastSearch(null); // Prevent repeat firing
    }

    // Track loading state for transition detection
    if (context.isLoading) {
      wasLoading.current = true;
    }
  }, [context.isLoading, lastSearch, count]);

  return (
    <div className="my-2" data-testid="filtering">
      <p className="mb-1 text-sm">{"Search by Package ID, CPOC Name, or Submitter Name"}</p>
      <div className="flex w-full lg:flex-row flex-col flex-grow justify-between gap-2">
        <SearchForm
          isSearching={context.isLoading}
          urlState={url.state}
          handleSearch={(search) => {
            url.onSet((s) => ({
              ...s,
              pagination: { ...s.pagination, number: 0 },
              search,
            }));
            setLastSearch(search);
          }}
          disabled={!!disabled}
        />
        <div className="flex flex-wrap justify-center gap-2 max-w-full">
          <VisibilityPopover
            list={columns.filter((COL) => COL.locked !== true && COL.field)}
            onItemClick={onToggle}
            hiddenColumns={columns.filter((COL) => COL.hidden === true)}
          />
          <OsFilterDrawer />
          <OsExportData
            columns={columns}
            disabled={context?.data?.total.value === 0}
            count={count}
          />
        </div>
      </div>
    </div>
  );
};

export * from "./Chipbar";
export * from "./FilterProvider";
export * from "./Export";
