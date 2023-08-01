import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";
import { SearchData } from "./useSearch";

export const getItem = async (id: string): Promise<{ hits: SearchData[] }> => {
  const record = await API.post("os", "/item", { body: { id } });

  return record;
};

export const useGetItem = (
  id: string,
  options?: UseQueryOptions<{ hits: SearchData[] }, ReactQueryApiError>
) => {
  return useQuery<{ hits: SearchData[] }, ReactQueryApiError>(
    ["record", id],
    () => getItem(id),
    options
  );
};
