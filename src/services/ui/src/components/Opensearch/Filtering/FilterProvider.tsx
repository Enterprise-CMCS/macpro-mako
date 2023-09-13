import { ReactNode, useState } from "react";
import { FILTER_GROUPS as FC } from "./consts";
import { createContextProvider } from "@/utils";

interface FilterContextState {
  filters: typeof FC;
  setFilters: React.Dispatch<React.SetStateAction<typeof FC>>;
  drawerOpen: boolean;
  setDrawerState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const [FilterDrawerContextProvider, useFilterDrawerContext] =
  createContextProvider<FilterContextState>({
    name: "Filter Drawer Context",
    errorMessage: "forgot to wrap with FilterDrawerProvider",
  });

export const FilterDrawerProvider = (props: {
  children: ReactNode;
  value?: FilterContextState;
}) => {
  const [filters, setFilters] = useState(FC);
  const [drawerOpen, setDrawerState] = useState(false);

  return (
    <FilterDrawerContextProvider
      {...props}
      value={
        props.value ?? {
          filters,
          setFilters,
          drawerOpen,
          setDrawerState,
        }
      }
    />
  );
};
