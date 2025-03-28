import { QueryClient } from "@tanstack/react-query";
import { redirect } from "react-router";

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

    // check user query has been initialized
    if (!queryClient.getQueryData(["user"])) {
      const userFetch = await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
      const isUserLoggedIn =
        !["/login", "/faq"].includes(window.location.pathname) && !userFetch?.user;

      if (isUserLoggedIn) {
        return redirect("/login");
      }
    }

    return queryClient.getQueryData(["user"]);
  };
};
