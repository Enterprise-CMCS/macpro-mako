import { useQuery } from "@tanstack/react-query";
import { Auth } from "aws-amplify";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";

export type OneMacUser = { isCms?: boolean, user: CognitoUserAttributes | null }

export const getUser = async (): Promise<OneMacUser> => {
  try {
    const authenticatedUser = await Auth.currentAuthenticatedUser();
    console.log(authenticatedUser);
    console.log("what is this url?", authenticatedUser.signInUserSession.idToken.payload.iss);
    const attributes = await Auth.userAttributes(authenticatedUser);

    const user = attributes.reduce((obj: { [key: string]: string }, item) => {
      obj[item.Name] = item.Value;
      return obj;
    }, {}) as unknown as CognitoUserAttributes;
    if (!user["custom:cms-roles"]) {
      user["custom:cms-roles"] = "";
    }

    const isCms = isCmsUser(user);
    return { user, isCms } satisfies OneMacUser;
  } catch (e) {
    console.log({ e });
    return { user: null } satisfies OneMacUser;
  }
};

export const useGetUser = () =>
  useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });
