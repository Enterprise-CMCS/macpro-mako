import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";

export const getSeaToolData = async (stateCode: string) => {
  const seaToolData = await API.get("issues", `/seatool/${stateCode}`, {});

  return seaToolData;
};

export const useGetSeatool = (stateCode: string) =>
  useQuery({
    queryKey: ["seatool", stateCode],
    queryFn: () => getSeaToolData(stateCode),
  });
