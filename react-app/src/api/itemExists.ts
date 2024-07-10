import { API } from "aws-amplify";

export const itemExists = async (id: string): Promise<boolean> => {
  const response = await API.post("os", "/itemExists", { body: { id } });
  console.log(response);
  return response.exists;
};
