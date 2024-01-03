import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { MainItemResult, ReactQueryApiError } from "shared-types";

export const getItem = async (id: string): Promise<MainItemResult> =>
  await API.post("os", "/item", { body: { id } });

export const idIsUnique = async (id: string) => {
  try {
    await getItem(id);
    return false;
  } catch (e) {
    return true;
  }
};

export const useGetItem = (
  id: string,
  options?: UseQueryOptions<MainItemResult, ReactQueryApiError>
) => {
  return useQuery<MainItemResult, ReactQueryApiError>(
    ["record", id],
    () => getItem(id),
    options
  );
};
