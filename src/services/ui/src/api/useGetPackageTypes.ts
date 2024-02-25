import { ReactQueryApiError } from "shared-types";
import { types, subtypes } from "shared-types/opensearch";
import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// Types //
const getSeaTypesCombined = async <T>(
  authorityId: number,
  typeId?: string
): Promise<T[]> => {
  const endpoint = "/getSeaTypes";
  const body = typeId ? { authorityId, typeId } : { authorityId };

  const response = await API.post("os", endpoint, {
    body,
  });

  const results = typeId ? response.seaSubTypes : response.seaTypes;

  return (
    results.hits?.hits.map(
      (h: types.ItemResult | subtypes.ItemResult) => h._source
    ) || []
  );
};

export const useGetSeaTypes = <T>(
  authorityId: number,
  typeId?: string,
  options?: UseQueryOptions<T[], ReactQueryApiError>
) => {
  return useQuery<T[], ReactQueryApiError>(
    ["types-subtypes", authorityId, typeId],
    () => getSeaTypesCombined(authorityId, typeId),
    {
      ...options,
    }
  );
};
