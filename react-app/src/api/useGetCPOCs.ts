import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";
import { cpocs } from "shared-types/opensearch";

export async function fetchCpocData() {
  try {
    const response = await API.post("os", "/getCpocs", { body: {} });
    const results = response.hits?.hits || [];
    return results.map((hit: cpocs.ItemResult) => hit._source);
  } catch (error) {
    console.error("Error fetching CPOCs:", error);
  }
}

export function useGetCPOCs<T>(queryOptions?: UseQueryOptions<T[], ReactQueryApiError>) {
  return useQuery<T[], ReactQueryApiError>(["package-cpocs"], () => fetchCpocData(), queryOptions);
}
