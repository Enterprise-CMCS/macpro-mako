import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";

export type UserDetails = {
  id: string;
  eventType: string;
  email: string;
  fullName: string;
  role: string;
};

export const getUserDetails = async (): Promise<UserDetails | null> => {
  try {
    const userDetails = await API.get("os", "/getUserDetails", {});

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
