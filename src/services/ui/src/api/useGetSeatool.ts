import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { SeatoolData, ReactQueryApiError } from "shared-types";

export const getSeaToolData = async (
  stateCode: string
): Promise<SeatoolData[]> => {
  const seaToolData = await API.get("issues", `/seatool/${stateCode}`, {});

  return seaToolData;
};

export const useGetSeatool = (
  stateCode: string,
  options?: UseQueryOptions<SeatoolData[], ReactQueryApiError>
) =>
  useQuery<SeatoolData[], ReactQueryApiError>(["seatool", stateCode], {
    queryFn: () => getSeaToolData(stateCode),
    ...options,
  });
