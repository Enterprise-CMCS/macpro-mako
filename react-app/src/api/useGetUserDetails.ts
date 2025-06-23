import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { UserRole } from "shared-types/events/legacy-user";

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

export const getUserDetails = async (userEmail?: string): Promise<UserDetails> => {
  try {
    console.log("getUserDetails", userEmail);
    const userDetails = await API.post("os", "/getUserDetails", { body: { userEmail } });

    console.log({ userDetails });
    return userDetails as UserDetails;
  } catch (e) {
    console.log({ e });
    return null;
  }
};

export const useGetUserDetails = () =>
  useQuery({
    queryKey: ["userDetails"],
    queryFn: () => getUserDetails(),
  });
