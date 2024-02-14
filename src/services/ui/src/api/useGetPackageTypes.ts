import { ReactQueryApiError } from "shared-types";
import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { types, subtypes } from "shared-types/opensearch";

// Types //
const getSeaTypes = async (authorityId: number): Promise<types.Document[]> => {
  const { seaTypes } = await API.post("os", "/getSeaTypes", {
    body: { authorityId },
  });
  return seaTypes.hits?.hits.map((h: any) => h._source) || [];
};

export const useGetSeaTypes = (
  authorityId: number,
  options?: UseQueryOptions<types.Document[], ReactQueryApiError>
) => {
  return useQuery<types.Document[], ReactQueryApiError>(
    ["packeage-types", authorityId],
    () => getSeaTypes(authorityId),
    options
  );
};

// SubTypes //

const getSeaSubTypes = async (
  authorityId: number,
  typeId: string
): Promise<subtypes.Document[]> => {
  const { seaSubTypes } = await API.post("os", "/getSeaSubTypes", {
    body: { authorityId, typeId },
  });
  return seaSubTypes.hits?.hits.map((h: any) => h._source) || [];
};
export const useGetSeaSubTypes = (
  authorityId: number,
  typeId: string,
  options?: UseQueryOptions<subtypes.Document[], ReactQueryApiError>
) => {
  return useQuery<subtypes.Document[], ReactQueryApiError>(
    ["packeage-sub-types", authorityId, typeId],
    () => getSeaSubTypes(authorityId, typeId),
    options
  );
};
