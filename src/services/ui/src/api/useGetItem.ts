import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { OsHit, OsMainSourceItem, ReactQueryApiError } from "shared-types";

export const getItem = async (id: string): Promise<OsHit<OsMainSourceItem>> => {
  const record = await API.post("os", "/item", { body: { id } });

  return record;
};

export const useGetItem = (
  id: string,
  options?: UseQueryOptions<OsHit<OsMainSourceItem>, ReactQueryApiError>
) => {
  return useQuery<OsHit<OsMainSourceItem>, ReactQueryApiError>(
    ["record", id],
    () => getItem(id),
    options
  );
};
