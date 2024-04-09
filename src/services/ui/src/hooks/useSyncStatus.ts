import { getItem, useGetItem } from "@/api";
import { Route, urlEmbedQuery } from "@/components/Routing";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { type SEATOOL_STATUS } from "shared-types";
import { queryClient } from "@/router";
import { ItemResult } from "shared-types/opensearch/main";
import { OsUrlState } from "@/components";
import { authorityById } from "@/utils";

export type SeaStatus = (typeof SEATOOL_STATUS)[keyof typeof SEATOOL_STATUS];

export const useSyncStatus = ({
  path,
  isCorrectStatus,
}: {
  path: Route | "..";
  isCorrectStatus: (data: ItemResult) => boolean;
}) => {
  const navigate = useNavigate();
  const [runQuery, setRunQuery] = useState(false);
  const [id, setId] = useState("");
  const authority = authorityById(id);
  console.log("what is the authority", authority);
  // An unfortunate evil for now unless another idea is found
  // the key needs to be unique to avoid an edge case where
  // the state doesn't get reset because the key is the same
  // This is important because of us relying on the query state
  // data update count to fallback
  const uniqueQueryId = useRef(Math.random());

  useQuery({
    queryKey: ["polling", id, uniqueQueryId],
    queryFn: async () => {
      try {
        return await getItem(id);
      } catch (err: unknown) {
        return null;
      }
    },
    refetchInterval: (data, query) => {
      if (query.state.dataUpdateCount > 10) {
        queryClient.invalidateQueries(["actions", id]);
        navigate(path);
        return false;
      }

      if (data && isCorrectStatus(data)) {
        queryClient.invalidateQueries(["actions", id]);
        if (path === "/dashboard") {
          const newPath = urlEmbedQuery<Partial<OsUrlState>>("/dashboard", {
            tab: authority === "" ? "spas" : authority,
          });
          navigate(newPath);
        } else {
          navigate(path);
        }
        return false;
      }

      return 1000; //aka 1 second
    },
    enabled: runQuery,
  });

  return (id: string) => {
    setRunQuery(true);
    setId(id);
  };
};
