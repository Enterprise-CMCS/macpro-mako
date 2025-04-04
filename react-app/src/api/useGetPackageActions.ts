import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { Action, ReactQueryApiError } from "shared-types";
type PackageActionsResponse = {
  actions: Action[];
};
export const getPackageActions = async (id: string): Promise<PackageActionsResponse> =>
  await API.post("os", "/getPackageActions", { body: { id } });

export const useGetPackageActions = (
  id: string,
  options?: UseQueryOptions<PackageActionsResponse, ReactQueryApiError>,
) => {
  return useQuery<PackageActionsResponse, ReactQueryApiError>(
    ["actions", id],
    () => getPackageActions(id),
    options,
  );
};
