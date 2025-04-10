import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";

export const getRoleRequests = async (): Promise<string> => {
  try {
    const role = await API.get("os", "/getRoleRequests", {});
    return JSON.stringify(role);
  } catch (e) {
    console.log({ e });
    return "";
  }
};

export const useGetRoleRequests = () =>
  useQuery({
    queryKey: ["roleRequests"],
    queryFn: () => getRoleRequests(),
  });
