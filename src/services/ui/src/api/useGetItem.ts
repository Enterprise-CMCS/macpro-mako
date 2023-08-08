import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";

export const getItem = async (id: string): Promise<any> => {
  const record = await API.post("os", "/item", { body: { id } });

  return record;
};

export const useGetItem = (
  id: string,
  options?: UseQueryOptions<any, ReactQueryApiError>
) => {
  return useQuery<any, ReactQueryApiError>(
    ["record", id],
    () => getItem(id),
    options
  );
};
