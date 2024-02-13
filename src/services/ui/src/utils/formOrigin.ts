import { Route } from "@/components/Routing/types";
import { useMemo } from "react";
import { useQuery as useQueryString } from "@/hooks";
import { useParams } from "@/components/Routing";

export type Origin = "actionsDashboard" | "actionsDetails" | "options";
export const ORIGIN = "origin"; // Const for query key access
export const originRoute: Record<Origin, Route> = {
  actionsDashboard: "/dashboard",
  actionsDetails: "/details",
  options: "/dashboard",
};

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
