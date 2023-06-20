import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";

export const getSeaToolData = async () => {
  const seaToolData = await API.get("issues", "/seatool", {});

  return seaToolData;
};

export const useGetSeatool = () =>
  useQuery({
    queryKey: ["seatool"],
    queryFn: getSeaToolData,
  });
