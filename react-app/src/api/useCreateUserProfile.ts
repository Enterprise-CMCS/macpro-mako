import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { UserRole } from "shared-types/events/legacy-user";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";
export type UserDetails = {
  id: string;
  eventType: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export const createUserProfile = async (): Promise<unknown> => {
  try {
    const userDetails = await API.get("os", "/createUserProfile", {});

    return userDetails as UserDetails;
  } catch (e) {
    sendGAEvent("api_error", {
      message: "failure /createUserProfile",
    });
    console.log({ e });
    return null;
  }
};

export const useCreateUserProfile = () =>
  useMutation({
    mutationFn: () => createUserProfile(),
  });
