import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { opensearch, ReactQueryApiError } from "shared-types";
import { subtypes } from "shared-types/opensearch";

export async function fetchSubTypes(
  authorityId: number,
  typeIds: number[],
): Promise<opensearch.subtypes.Document[]> {
  const endpoint = "/getSubTypes";
  const body = { authorityId, typeIds };

  try {
    const response = await API.post("os", endpoint, { body });
    const hits = response.hits?.hits || [];

    return hits.map((hit: subtypes.ItemResult) => hit._source);
  } catch (error) {
    console.error("Error fetching types:", error);
    throw new Error("Failed to fetch types");
  }
}

export function useGetSubTypes(
  authorityId: number,
  typeIds: number[],
  options?: UseQueryOptions<opensearch.subtypes.Document[], ReactQueryApiError>,
) {
  return useQuery<opensearch.subtypes.Document[], ReactQueryApiError>(
    ["package-subtypes", authorityId, typeIds],
    () => fetchSubTypes(authorityId, typeIds),
    options,
  );
}
