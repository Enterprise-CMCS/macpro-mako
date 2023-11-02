import { Action, ReactQueryApiError } from "shared-types";
import { API } from "aws-amplify";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
type PackageActionsResponse = {
  actions: Action[];
};
const getPackageActions = async (id: string): Promise<PackageActionsResponse> =>
  await API.post("os", "/getPackageActions", { body: id });

export const useGetPackageActions = (
  id: string,
  options?: UseQueryOptions<PackageActionsResponse, ReactQueryApiError>
) => {
  return useQuery<PackageActionsResponse, ReactQueryApiError>(
    ["actions", id],
    () => getPackageActions(id),
    options
  );
};
