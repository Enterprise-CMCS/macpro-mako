import { ReactQueryApiError } from "shared-types";
import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { types, subtypes } from "shared-types/opensearch";

type GetTypesResponse = {
  data: types.Document[];
};
const getSeaTypes = async (authorityId: string): Promise<GetTypesResponse> =>
  await API.post("os", "/getSeaTypes", { body: { authorityId } });

export const useGetSeaTypes = (
  authorityId: string,
  options?: UseQueryOptions<GetTypesResponse, ReactQueryApiError>
) => {
  return useQuery<GetTypesResponse, ReactQueryApiError>(
    ["packeage-types", authorityId],
    () => getSeaTypes(authorityId),
    options
  );
};

// SubTypes //

type GetSubTypesResponse = {
  data: subtypes.Document[];
};
const getSeaSubTypes = async (
  authorityId: string,
  typeId: string
): Promise<GetSubTypesResponse> =>
  await API.post("os", "/getSeaSubTypes", { body: { authorityId, typeId } });

export const useGetSeaSubTypes = (
  authorityId: string,
  typeId: string,
  options?: UseQueryOptions<GetSubTypesResponse, ReactQueryApiError>
) => {
  return useQuery<GetSubTypesResponse, ReactQueryApiError>(
    ["packeage-sub-types", authorityId, typeId],
    () => getSeaSubTypes(authorityId, typeId),
    options
  );
};
