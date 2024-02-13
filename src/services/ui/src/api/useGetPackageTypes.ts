import { Action, ReactQueryApiError } from "shared-types";
import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
type PackageActionsResponse = {
  actions: Action[];
};
const getPackageTypes = async (
  authorityId: string
): Promise<PackageActionsResponse> =>
  await API.post("os", "/getPackageTypes", { body: { authorityId } });

export const useGetPackageActions = (
  authorityId: string,
  options?: UseQueryOptions<PackageActionsResponse, ReactQueryApiError>
) => {
  return useQuery<PackageActionsResponse, ReactQueryApiError>(
    ["packeage-types", authorityId],
    () => getPackageTypes(authorityId),
    options
  );
};
