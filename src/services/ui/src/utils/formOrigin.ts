import { Route } from "@/components/Routing/types";
import { useMemo } from "react";
import { useQuery as useQueryString } from "@/hooks";
import { useParams } from "@/components/Routing";

/** Type for defining possible origin values for routing. */
export type Origin = "actionsDashboard" | "actionsDetails" | "options";
/** Constant key for accessing origin in query string. */
export const ORIGIN = "origin";
/** Mapping of origin types to their corresponding route strings. */
export const originRoute: Record<Origin, Route> = {
  actionsDashboard: "/dashboard",
  actionsDetails: "/details",
  options: "/dashboard",
};
/**
 * Hook to compute route based on origin query parameter and URL params.
 */
export const useOriginPath = () => {
  const urlQuery = useQueryString();
  const { id } = useParams("/action/:id/:type");
  return useMemo(() => {
    const origin = urlQuery.get(ORIGIN) as Origin | null;
    if (!origin || !originRoute[origin as Origin]) return null;
    return (origin as Origin) === "actionsDetails"
      ? (`${originRoute[origin as Origin]}?id=${id}` as Route)
      : (originRoute[origin as Origin] as Route);
  }, []);
};
