import { API } from "aws-amplify";

export const getRoleRequests = async (): Promise<string> => {
  try {
    const role = await API.get("os", "/getRoleRequests", {});
    return role;
  } catch (e) {
    console.log({ e });
    return "";
  }
};
