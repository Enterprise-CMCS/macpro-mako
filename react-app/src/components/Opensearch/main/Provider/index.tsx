import { ReactNode } from "react";
import { opensearch, ReactQueryApiError } from "shared-types";

import { createContextProvider } from "@/utils";

export type ContextState = {
  data: opensearch.main.Response["hits"] | undefined;
  isLoading: boolean;
  error: ReactQueryApiError | null;
};

export const [OsContextProvider, useOsContext] = createContextProvider<ContextState>({
  name: "OsSearch Context",
  errorMessage: "forgot to wrap with OsProvider",
});

export const OsProvider = (props: { children: ReactNode; value: ContextState }) => {
  return <OsContextProvider {...props} />;
};
