import { getItem } from "@/api";
import { Route } from "@/components/Routing";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { type SEATOOL_STATUS } from "shared-types";
import { queryClient } from "@/router";
import { ItemResult } from "shared-types/opensearch/main";

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
        navigate(path);
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
