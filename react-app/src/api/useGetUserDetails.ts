import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { UserDetails } from "shared-types";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

const USER_DETAILS_QUERY_STALE_TIME_MS = 5 * 60 * 1000;

export const getUserDetails = async (userEmail?: string): Promise<UserDetails | null> => {
  try {
    const userDetails = await API.post("os", "/getUserDetails", { body: { userEmail } });

    return userDetails as UserDetails;
  } catch (e) {
    sendGAEvent("api_error", {
      message: `failure /getUserDetails ${userEmail || ""}`,
    });
    console.log({ e });
    return null;
  }
};

export const userDetailsQueryOptions = {
  queryKey: ["userDetails"],
  queryFn: () => getUserDetails(),
  staleTime: USER_DETAILS_QUERY_STALE_TIME_MS,
  refetchOnWindowFocus: false,
};

export const useGetUserDetails = () => useQuery<UserDetails | null>(userDetailsQueryOptions);
