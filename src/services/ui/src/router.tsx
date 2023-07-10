import { createBrowserRouter } from "react-router-dom";
import MainWrapper from "./components/MainWrapper";
import * as P from "./pages";
import { Amplify, Auth } from "aws-amplify";
import config from "./config";
import { CognitoUserAttributes } from "shared-types";
import { getParsedObject } from "./utils";

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
    oauth: {
      domain: config.cognito.APP_CLIENT_DOMAIN,
      redirectSignIn: config.cognito.REDIRECT_SIGNIN,
      redirectSignOut: config.cognito.REDIRECT_SIGNOUT,
      scope: ["email", "openid"],
      responseType: "code",
    },
  },
  API: {
    endpoints: [
      {
        name: "seatool",
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
      },
    ],
  },
});

export const getLoaderInfo = async () => {
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainWrapper />,
    children: [
      { path: "/", element: <P.Welcome /> },
      { path: "/dashboard", element: <P.Dashboard /> },
      { path: "/medicaid", element: <P.Medicaid /> },
      { path: "/chip", element: <P.Chip /> },
      { path: "/waiver", element: <P.Waiver /> },
      { path: "/record", element: <P.ViewRecord /> },
    ],
    loader: getLoaderInfo,
  },
]);
