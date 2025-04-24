import { QueryClient } from "@tanstack/react-query";
import { redirect } from "react-router";

import { getUser } from "@/api";
import { createUserProfile } from "@/api/useCreateUserProfile";
import { requestBaseCMSAccess } from "@/api/useRequestBaseCMSAccess";

export const loader = (queryClient: QueryClient, loginFlag?: boolean) => {
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

    await requestBaseCMSAccess();
    await createUserProfile();

    // check user query has been initialized
    if (!queryClient.getQueryData(["user"])) {
      const userFetch = await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
      const isUserLoggedIn =
        !["/login", "/faq", "/support"].includes(window.location.pathname) && !userFetch?.user;

      if (!loginFlag && isUserLoggedIn) {
        return redirect("/login");
      }
    }

    return queryClient.getQueryData(["user"]);
  };
};
