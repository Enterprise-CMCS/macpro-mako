import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { opensearch, ReactQueryApiError } from "shared-types";
import { subtypes, types } from "shared-types/opensearch";

type FetchOptions = {
  authorityId: number | string;
  typeIds?: number[] | string[];
};

export async function fetchData<T>({ authorityId, typeIds }: FetchOptions): Promise<T[]> {
  const endpoint = typeIds ? "/getSubTypes" : "/getTypes";
  const body = typeIds ? { authorityId, typeIds } : { authorityId };

  try {
    const response = await API.post("os", endpoint, { body });
    const hits = response.hits?.hits || [];

    if (typeIds) {
      return hits.map((hit: subtypes.ItemResult) => hit._source as T);
    } else {
      return hits.map((hit: types.ItemResult) => hit._source as T);
    }
  } catch (error) {
    console.error(`Error fetching ${typeIds ? "subtypes" : "types"}:`, error);
    throw new Error(`Failed to fetch ${typeIds ? "subtypes" : "types"}`);
  }
}

export function useGetData<T>(
  options: FetchOptions,
  queryOptions?: UseQueryOptions<T[], ReactQueryApiError>,
) {
  const { authorityId, typeIds } = options;
  const queryKey = typeIds
    ? ["package-subtypes", authorityId, typeIds]
    : ["package-types", authorityId];

  return useQuery<T[], ReactQueryApiError>(queryKey, () => fetchData<T>(options), queryOptions);
}

export function useGetTypes(
  authorityId: number | string,
  options?: UseQueryOptions<opensearch.types.Document[], ReactQueryApiError>,
) {
  return useGetData<opensearch.types.Document>({ authorityId }, options);
}

export function useGetSubTypes(
  authorityId: number | string,
  typeIds: number[] | string[],
  options?: UseQueryOptions<opensearch.subtypes.Document[], ReactQueryApiError>,
) {
  return useGetData<opensearch.subtypes.Document>({ authorityId, typeIds }, options);
}
