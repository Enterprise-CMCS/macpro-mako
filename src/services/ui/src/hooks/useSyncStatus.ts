import { getItem } from "@/api";
import { Route, useNavigate } from "@/components/Routing";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type SEATOOL_STATUS } from "shared-types";

type SeaStatus = (typeof SEATOOL_STATUS)[keyof typeof SEATOOL_STATUS];

export const useSyncStatus = ({
  expectedStatus,
  path,
}: {
  expectedStatus: SeaStatus;
  path: Route;
}) => {
  const navigate = useNavigate();
  const [runQuery, setRunQuery] = useState(false);
  const [id, setId] = useState("");

  useQuery({
    queryKey: ["record", id],
    queryFn: () => getItem(id),
    refetchInterval: (data, query) => {
      // don't want to hammer it if nothing is happening likely something is wrong at this point)
      if (query.state.dataUpdateCount > 10) {
        navigate({ path });
        return false;
      }

      console.log("status in seatool is: ", data?._source.seatoolStatus);
      console.log("status expected is: ", expectedStatus);

      // return to dashboard when the status has successfuly updated
      if (data && data._source.seatoolStatus === expectedStatus) {
        console.log("it got here");
        navigate({ path });
        return false;
      }

      // otherwise try again in one second
      return 1000; //aka 1 second
    },
    enabled: runQuery,
  });

  // return a callback function that the user executes to kick the above function off and start polling
  return (id: string) => {
    setRunQuery(true);
    setId(id);
  };
};
