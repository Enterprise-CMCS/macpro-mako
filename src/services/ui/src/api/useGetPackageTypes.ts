import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ReactQueryApiError } from "shared-types";
import { types, subtypes } from "shared-types/opensearch";

async function fetchSeaTypes<T>(
  authorityId: number,
  typeId?: string
): Promise<T[]> {
  const endpoint = "/getSeaTypes";
  const body = { authorityId, ...(typeId && { typeId }) };

  try {
    const response = await API.post("os", endpoint, { body });
    const key = typeId ? "seaSubTypes" : "seaTypes";
    const hits = response[key]?.hits?.hits || [];

    return hits.map(
      (hit: types.ItemResult | subtypes.ItemResult) => hit._source
    );
  } catch (error) {
    console.error("Error fetching types:", error);
    throw new Error("Failed to fetch types");
  }
}

export function useSeaTypes<T>(
  authorityId: number,
  typeId?: string,
  options?: UseQueryOptions<T[], ReactQueryApiError>
) {
  return useQuery<T[], ReactQueryApiError>(
    ["package-types", authorityId, typeId],
    () => fetchSeaTypes<T>(authorityId, typeId),
    options
  );
}
