import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { UserRole } from "shared-types/events/legacy-user";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";
export type UserDetails = {
  id: string;
  eventType: string;
  email: string;
  fullName: string;
  role?: UserRole;
  states?: string[];
  division: string;
  group: string;
};

export const getUserDetails = async (userEmail?: string): Promise<UserDetails | null> => {
  try {
    const userDetails = await API.post("os", "/getUserDetails", { body: { userEmail } });

    return userDetails as UserDetails;
  } catch (e) {
    sendGAEvent("api_error", {
      message: `failure /getUserDetails: ${e}`,
    });
    console.log({ e });
    return null;
  }
};

export const useGetUserDetails = () =>
  useQuery<UserDetails | null>({
    queryKey: ["userDetails"],
    queryFn: () => getUserDetails(),
  });
