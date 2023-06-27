import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { SeatoolData, ReactQueryApiError } from "shared-types";

export const getSeaToolData = async (stateCode: string) => {
  const seaToolData = await API.get("issues", `/seatool/${stateCode}`, {});

  return seaToolData;
};

export const useGetSeatool = (stateCode: string, options?: any) =>
  useQuery<SeatoolData[], ReactQueryApiError>(["seatool", stateCode], {
    queryFn: () => getSeaToolData(stateCode),
    ...options,
  });
