import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";
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
    const stateAccess = await API.post(
      "os",
      "/getUserProfile",
      userEmail ? { body: { userEmail } } : {},
    );

    return {
      stateAccess,
    } as OneMacUserProfile;
  } catch (e) {
    sendGAEvent("api_error", {
      message: "error getting user profile",
    });
    console.log({ e });
    return {};
  }
};

export const useGetUserProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(),
  });
