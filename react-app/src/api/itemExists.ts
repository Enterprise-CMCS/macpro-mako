import { API } from "aws-amplify";

export const itemExists = async (id: string): Promise<boolean> => {
  try {
    const response = await API.post("os", "/itemExists", { body: { id } });
    return response.exists;
  } catch (error) {
    console.error("Error checking if item exists:", error);
    return false;
  }
};
