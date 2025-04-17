import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";

// export type UserDetails = {
//   id: string;
//   email: string;
//   fullName: string;
// };
// put return type

export const getUserDetails = async () => {
  try {
    const userDetails = await API.get("os", "/getUserDetails", {});

    return JSON.stringify(userDetails);
  } catch (e) {
    console.log({ e });
    return "";
  }
};

export const useGetUserDetails = () =>
  useQuery({
    queryKey: ["userDetails"],
    queryFn: () => getUserDetails(),
  });
