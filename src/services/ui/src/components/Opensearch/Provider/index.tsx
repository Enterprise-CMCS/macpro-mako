import { ReactNode } from "react";
import { createContextProvider } from "@/utils";
import { ReactQueryApiError, OsMainSearchResponse } from "shared-types";

type ContextState = {
  data: OsMainSearchResponse["hits"] | undefined;
  isLoading: boolean;
  error: ReactQueryApiError | null;
};

export const [OsContextProvider, useOsContext] =
  createContextProvider<ContextState>({
    name: "OsSearch Context",
    errorMessage: "forgot to wrap with OsProvider",
  });

export const OsProvider = (props: {
  children: ReactNode;
  value: ContextState;
}) => {
  return <OsContextProvider {...props} />;
};
