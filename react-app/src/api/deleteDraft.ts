import { API } from "aws-amplify";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export const deleteDraft = async (id: string) => {
  try {
    return await API.post("os", "/deleteDraft", { body: { id } });
  } catch (error) {
    sendGAEvent("api_error", {
      error: `failure /deleteDraft ${id}`,
    });
    throw error;
  }
};
