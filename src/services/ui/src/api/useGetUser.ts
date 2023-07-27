import "@/api/amplifyConfig";
import { useQuery } from "@tanstack/react-query";
import { Auth } from "aws-amplify";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";

export const getUser = async () => {
  try {
    const authenticatedUser = await Auth.currentAuthenticatedUser();
    const attributes = await Auth.userAttributes(authenticatedUser);
    const user = attributes.reduce(
      (obj: { [key: string]: string | string[] }, item) => {
        obj[item.Name] = item.Value;
        return obj;
      },
      {}
    ) as unknown as CognitoUserAttributes;

    const isCms = isCmsUser(user);

    return { user, isCms };
  } catch (e) {
    console.log({ e });
    return { user: null };
  }
};

export const useGetUser = () =>
  useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });
