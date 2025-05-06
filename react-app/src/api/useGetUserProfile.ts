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

export const getUserProfile = async (userEmail?: string): Promise<OneMacUserProfile> => {
  try {
    const stateAccess = await API.get("os", "/getUserProfile", { body: { userEmail } });

    return {
      stateAccess,
    } as OneMacUserProfile;
  } catch (e) {
    console.log({ e });
    return {};
  }
};

export const useGetUserProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(),
  });
