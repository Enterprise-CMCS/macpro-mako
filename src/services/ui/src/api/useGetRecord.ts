import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";
import { SearchData } from "./useSearch";

export const getRecord = async (
  id: string,
  state: string
): Promise<{ hits: SearchData[] }> => {
  const query = { query: { bool: { must: [{ match: { _id: id } }] } } };

  const record = await API.post("seatool", `/search/${state}`, {
    body: query,
  });

  return record;
};

export const useGetRecord = (
  id: string,
  region: string,
  options?: UseQueryOptions<{ hits: SearchData[] }, ReactQueryApiError>
) => {
  return useQuery<{ hits: SearchData[] }, ReactQueryApiError>(
    ["record", region, id],
    () => getRecord(id, region),
    options
  );
};
