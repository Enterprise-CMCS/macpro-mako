import { ReactNode, useState } from "react";
import { createContextProvider } from "@/utils";

export const [FilterDrawerContextProvider, useFilterDrawerContext] =
  createContextProvider<UseFilterDrawerCTX>({
    name: "Filter Drawer Context",
    errorMessage: "forgot to wrap with FilterDrawerProvider",
  });

const useFilterDrawerCTX = () => {
  const [drawerOpen, setDrawerState] = useState(false);

  return { drawerOpen, setDrawerState };
};

type UseFilterDrawerCTX = ReturnType<typeof useFilterDrawerCTX>;

export const FilterDrawerProvider = (props: { children: ReactNode }) => {
  return (
    <FilterDrawerContextProvider {...props} value={useFilterDrawerCTX()} />
  );
};
