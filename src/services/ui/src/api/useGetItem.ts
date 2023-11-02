import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ItemResult, ReactQueryApiError } from "shared-types";

export const getItem = async (id: string): Promise<ItemResult> => {
  const record = await API.post("os", "/item", { body: { id } });

  return record;
};

export const useGetItem = (
  id: string,
  options?: UseQueryOptions<ItemResult, ReactQueryApiError>
) => {
  return useQuery<ItemResult, ReactQueryApiError>(
    ["record", id],
    () => getItem(id),
    options
  );
};
