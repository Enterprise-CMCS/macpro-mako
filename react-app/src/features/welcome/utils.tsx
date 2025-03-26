import { QueryClient } from "@tanstack/react-query";

import { getUser } from "@/api";

export const loader = (queryClient: QueryClient) => {
  return async () => {
    const queryString = window.location.search;
    // Parse the query string to get URL parameters
    const queryParams = new URLSearchParams(queryString);
    // Access specific parameters
    const errorDescription = queryParams.get("error_description");
    const error = queryParams.get("error");
    if (errorDescription || error) {
      console.error("Authentication Error:", { errorDescription, error });
      return { error };
    }
    if (!queryClient.getQueryData(["user"])) {
      return await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
    }
    return queryClient.getQueryData(["user"]);
  };
};
