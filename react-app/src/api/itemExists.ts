import { API } from "aws-amplify";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export const itemExists = async (id: string): Promise<boolean> => {
  try {
    const response = await API.post("os", "/itemExists", { body: { id } });
    return response.exists;
  } catch (error) {
    sendGAEvent("api_errror", {
      error: `failure /itemExists ${id}: ${error}`,
    });
    console.error("Error checking if item exists:", error);
    return false;
  }
};
