import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";

export type StateAccess = {
  id: string;
  eventType: string;
  email: string;
  doneByEmail: string;
  doneByName: string;
  status: string;
  role: string;
  territory: string;
};

export type OneMacUserProfile = {
  stateAccess?: StateAccess[];
};

export const getUserProfile = async (userId?: string): Promise<OneMacUserProfile> => {
  try {
    const stateAccess = await API.post("os", "/getUserProfile", userId ? { body: { userId } } : {});

    return {
      stateAccess,
    } as OneMacUserProfile;
  } catch (e) {
    console.log({ e });
    return {};
  }
};

export const useGetUserProfile = (profileId?: string) =>
  useQuery({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(profileId),
  });
