import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ReactQueryApiError } from "shared-types";
import { cpocs } from "shared-types/opensearch";

export async function fetchCpocData() {
  const endpoint = "/getCPOCs";

  try {
    const response = await API.get("os", endpoint, {});
    const results = response.hits?.hits || [];

    return results.map((hit: cpocs.ItemResult) => hit._source);
  } catch (error) {
    console.error("Error fetching CPOCs:", error);
  }
}

export function useGetCPOCs<T>(
  queryOptions?: UseQueryOptions<T[], ReactQueryApiError>,
) {
  return useQuery<T[], ReactQueryApiError>(
    ["SeatoolOffcers"],
    () => fetchCpocData(),
    queryOptions,
  );
}
