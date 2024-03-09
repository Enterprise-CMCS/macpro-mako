import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { opensearch, ReactQueryApiError } from "shared-types";
import { types } from "shared-types/opensearch";

export async function fetchTypes(
  authorityId: number
): Promise<opensearch.types.Document[]> {
  const body = { authorityId };

  try {
    const response = await API.post("os", "/getTypes", { body });
    const hits = response.hits?.hits || [];

    return hits.map((hit: types.ItemResult) => hit._source);
  } catch (error) {
    console.error("Error fetching types:", error);
    throw new Error("Failed to fetch types");
  }
}

export function useGetTypes(
  authorityId: number,
  options?: UseQueryOptions<opensearch.types.Document[], ReactQueryApiError>
) {
  return useQuery<opensearch.types.Document[], ReactQueryApiError>(
    ["package-types", authorityId],
    () => fetchTypes(authorityId),
    options
  );
}
