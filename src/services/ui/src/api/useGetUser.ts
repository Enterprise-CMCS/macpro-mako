import "@/api/amplifyConfig";
import { getParsedObject } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Auth } from "aws-amplify";
import { CognitoUserAttributes } from "shared-types";

export const getUser = async () => {
  try {
    const authenticatedUser = await Auth.currentAuthenticatedUser();
    const attributes = await Auth.userAttributes(authenticatedUser);
    const user = attributes.reduce((obj: { [key: string]: string }, item) => {
      obj[item.Name] = item.Value;
      return obj;
    }, {});

    return { user: getParsedObject(user) as CognitoUserAttributes };
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
