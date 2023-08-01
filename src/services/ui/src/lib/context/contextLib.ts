import { Context, useContext, createContext } from "react";

import { AppContextValue } from "./domain-types";

export const AppContext = createContext(
  null
) as Context<AppContextValue | null>;

export function useAppContext(): AppContextValue | null {
  return useContext(AppContext);
}
