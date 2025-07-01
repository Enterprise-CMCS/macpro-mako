import { API } from "aws-amplify";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export const itemExists = async (id: string): Promise<boolean> => {
  try {
    const response = await API.post("os", "/itemExists", { body: { id } });
    return response.exists;
  } catch (error) {
    sendGAEvent("errror", {
      error: "item does not exist",
    });
    console.error("Error checking if item exists:", error);
    return false;
  }
};
