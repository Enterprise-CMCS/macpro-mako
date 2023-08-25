import { ReactNode } from "react";
import { createContextProvider } from "@/utils";
import { SearchData } from "shared-types";

export const [OsContextProvider, useOsContext] = createContextProvider<
  SearchData["hits"]
>({
  name: "OsSearch Context",
  errorMessage: "forgot to wrap with OsProvider",
});

export const OsProvider = (props: {
  children: ReactNode;
  value: SearchData["hits"];
}) => {
  return <OsContextProvider {...props} />;
};
