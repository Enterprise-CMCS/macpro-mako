import jwt from "jsonwebtoken";
import { http, HttpResponse, passthrough, PathParams } from "msw";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser } from "shared-utils";
import {
  CognitoUserResponse,
  makoReviewer,
  makoStateSubmitter,
  userResponses,
} from "../data/users";

export const ACCESS_KEY_ID = "ASIAZHXA3XOU7XZ53M36";
export const SECRET_KEY = "UWKCFxhrgbPnixgLnL1JKwFEwiK9ZKvTAtpk8cGa";

export const setMockUsername = (user?: string | CognitoUserResponse | null): void => {
  if (user) {
    if (typeof user === "string") {
      process.env.MOCK_USER_USERNAME = user;
    } else {
      process.env.MOCK_USER_USERNAME = user.Username;
    }
  } else {
    delete process.env.MOCK_USER_USERNAME;
  }
};

export const useDefaultStateSubmitter = () => setMockUsername(makoStateSubmitter);

export const useDefaultReviewer = () => setMockUsername(makoReviewer);

export const mockCurrentAuthenticatedUser = async () => {
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      return {
        username: user.Username,
        attributes: user.UserAttributes,
        preferredMFA: "NOMFA",
      };
    }
    return undefined;
  }
  return undefined;
};

export const mockUserAttributes = async (currentAuthenticatedUser: any) => {
  if (currentAuthenticatedUser?.currentAuthenticatedUser?.attributes) {
    return currentAuthenticatedUser.currentAuthenticatedUser.attributes;
  }
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      return user.UserAttributes;
    }
  }
  return undefined;
};

export const mockUseGetUser = () => {
  if (process.env.MOCK_USER_USERNAME) {
    const user = findUserByUsername(process.env.MOCK_USER_USERNAME);
    if (user) {
      // Set object up with key/values from attributes array
      const userAttributesObj = user?.UserAttributes?.reduce(
        (obj, item) =>
          item?.Name && item?.Value
            ? {
                ...obj,
                [item.Name]: item.Value,
              }
            : obj,
        {} as CognitoUserAttributes,
      );
      // Manual additions and normalizations
      userAttributesObj["custom:cms-roles"] = userAttributesObj?.["custom:cms-roles"] || "";

      userAttributesObj.username = user?.Username || "";

      return {
        data: {
          user: userAttributesObj,
          isCms: isCmsUser(userAttributesObj),
        },
        isLoading: false,
        isSuccess: true,
      };
    }
  }
  return {
    data: null,
    isLoading: false,
    isSuccess: true,
  };
};

const findUserByUsername = (username: string): CognitoUserResponse | undefined =>
  userResponses.find((user) => user.Username == username);

export type IdpRequestBody = {
  AccessToken: string;
};

const getUsernameFromAccessToken = (accessToken?: string): string | undefined => {
  if (accessToken) {
    return jwt.decode(accessToken, { json: true })?.get("username");
  }
  return undefined;
};

export const signInHandler = http.post(/amazoncognito.com\/oauth2\/token/, () => {
  return HttpResponse.json({
    id_token:
      "eyJraWQiOiIwWUNyR3ducWttMW9BRnhQZCtyY013K2doWTdjNjVET1pEeUdOZlBcL2xscz0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoidXpiZ3BGS01EVVFtT2Z6SlhDLVhnZyIsInN1YiI6IjI0NTg3NDA4LWIwZjEtNzA2Yy1jZjVhLTM2YmZjY2I0YjU4ZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjQ1ODc0MDgtYjBmMS03MDZjLWNmNWEtMzZiZmNjYjRiNThmIiwib3JpZ2luX2p0aSI6IjM3NzdjMTNiLWQxMDgtNDdjNC04NjI4LTdhYjQyMTBhYzc0NSIsImF1ZCI6IjFpMDdrMHV0ZGw5MmlqZTNwNG9uMjcwbmxiIiwiZXZlbnRfaWQiOiIxNjBiMTM5OS1iZTgxLTQ0OWMtYThmYi00ZDI1ZjJkYzdkYmIiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTczMjU2MDQ5NiwiZXhwIjoxNzMyNTYyMjk2LCJpYXQiOjE3MzI1NjA0OTYsImp0aSI6IjkxMGZkODFmLThlM2UtNDM3OS1hOTI0LTdmZTQ5NTFkMGEwNiIsImVtYWlsIjoiZ2VvcmdlQGV4YW1wbGUuY29tIn0.nATv19_8a8SM0m0O3mWirXrPLcYQfzRNm6Mz3SP1EO3OQkoS1FlPoAy4g55N5zVOt4rUBHqSwpTnUl9NWWLMz2vB54HLRd5i7OWmyQ1g39FMRyTb8ZGHw625gdzFpgld94a6gQi7SAKEQqRnWKtipCbsqsenJbKY6cnhWYz6vkHyoSEpur6_2N6iQ8fH8UC9F6dX9eSszP6xV-4VybB_RrbStP0BAPVPf9LKgc2Yba8ackJs0FCZQORKaR2NzLN9l47gFLQsWWMrF6Nee2rML4hotCopbl2ftvB4r9KbVk60mFBZ5azNZwKqlgYAnXDSM1ykidMTD76EeexNmzv8ig",
    access_token:
      "eyJraWQiOiJ2VVcrOUdaK1ZPdzZqTlwvaE9PS0J3dkREdG5VR0gweFV1OThcL25cL2VNSXBJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyNDU4NzQwOC1iMGYxLTcwNmMtY2Y1YS0zNmJmY2NiNGI1OGYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIxaTA3azB1dGRsOTJpamUzcDRvbjI3MG5sYiIsIm9yaWdpbl9qdGkiOiIzNzc3YzEzYi1kMTA4LTQ3YzQtODYyOC03YWI0MjEwYWM3NDUiLCJldmVudF9pZCI6IjE2MGIxMzk5LWJlODEtNDQ5Yy1hOGZiLTRkMjVmMmRjN2RiYiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIGVtYWlsIiwiYXV0aF90aW1lIjoxNzMyNTYwNDk2LCJleHAiOjE3MzI1NjIyOTYsImlhdCI6MTczMjU2MDQ5NiwianRpIjoiODVjODAzNGUtNzUxNC00YmI1LWFhZjgtZDY1Mzg2ODQ3YzE2IiwidXNlcm5hbWUiOiIyNDU4NzQwOC1iMGYxLTcwNmMtY2Y1YS0zNmJmY2NiNGI1OGYifQ.ijf3dP5huf4Q8bPo738PVflXd65RZfKvdrcyabjOrUS6z4HgN5Us8To5uD0FAAFP_L1_yqhTTteef7HTa1PQ1d0bnt2YuabBu4v25lWdMaWa7M4rSxbpnHmH19f57Nkld9QTNuKF4JFquyvzLedPoAkq1zKd_hHw1RH3THOcRSbYRjhmXWyAOPrP8Z4nPysJssWAsMs11_RE3N-AFqTiyfEH5Ob8a962WqlKL0K0_Kx23nOpsmLQC0OUTeAavzhCd82OuKJipp3PxxsJX6Y2Y98tNE3YQarzmg7Gyp9dQgE0cNjm7FrTkeH7E_wnex1MB3VUCUICTHktJFaeWg9iUw",
    refresh_token:
      "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.YnOKimvIKONVGieEKNVklUPKSGibe2uS-u2-0obGdn3RmOWB1Bmhv_ABcN42I5i2X7GurB7NXVfe9ZgfezhzqWdO7joNabH_VJiUNb9ZlFQAAXwgDrKvYW3p38a5vonhL5wujoDgkOJv_oeuN-U5JkZozLj7j2UAlib8ipFO5PboH-rYKfg4AVx9wql-Um6e3EuY2vpG--lkJnNUM_UWzrVZUKjTGR0XVeEUMjOWBI7ct1CMq9eNwnvMA7PI800f62cSKkqoiDff4J1If89cXETBwaYiiyY9onFcda1JcuhCMynfuYcDNOkSHaMFA7iqWbDVn7lviLBmBiaxn83kDA.kHQs7w26J-Ny9PzW.w25b1Mrk7YTs2ZnhHGly3Dxafke-cESdur-i5RdkS6rIBk6ECQMp9YtCIFnAYDSgoHtKFu5pDoREE3rl6Mj59IRGUvC4jiUWYISVDQEFMo_Z0W3yFDe9hcqdplMFCx7r_s4bm5euHeIySz2n3bFJZIhERlKUGECsxXme5DqnQENDYROupwrhDk-JRrLvHUuHnS-RD3huwqXdtyMQhh_Xk6KcG-qBnYGkj8102LcanqO1k2z4MN79V5IB0r-o9hpSRIQxJPj4S2a1qUN0cuaT3NGkH7U_ejPcmP-vDRedpHN3dscW-SbqRO-Rq7T_IpYTS8OSMxpTrddbjkQY8R4HSOzphxpB2pGzWDEK2kkGSTjC_QkejBmLUAznscNHuzbASvHRkkPYfMA8yMsFZuHq1i5zMC2_Yblx-Axsxq5eYKFiiEgJ6TiK1deobTMRtfoJHlmnyTRy6VIYBN8UbQgq4NH7xBYabtyuboiGLnS7kgUkeNunRzUCwgiOOI5tOE7pVADcU7vhtYU-8LNO-xvrEOaNw3-xI8NEJGcNBQBi3G87k3VOgXmDnaaiPJd2Oi6UvpOyT3hI_tEdbfYLoBl21diDvJObzb09WP_d8MA9SMRZRz7idw63sLRBOPvYsVqPKN9GtVir4idfHbGdred4PRnM799HY_B9ydEERkMzfclAaWnSE3rsfjFqfjwUm4RYUPJ_hwYuO_v3QAFJgdD-QnbkOOWlXdegRXL9iT_7Pbf8gi5t6WkJUKixLY8x3aq6XXRZq74njikIXViIt4PaqM2esO-GWn7HIQLS-xXS2YxPp1rJ-Q4yTc78TGw2TuvCPJu7CCWt8HorNy8_yJHkPuYXJuw8wQqKXb-g5xsgZWFd5oQt243iW6_LLZku4gBclM7MJhsR-QnlpjBhA4nOHo9V0N1Dsdh2G-hBlpWtzHBT5AHlbdzKVBdWLYugh_rrnvQ65KluHQ1k4XFN9FpQO0WNVDPBTDq7PWcH5FnalvStgbr_E-zab2jbTypFa45MPwYdwOtrvFUSYEtkQLaWJmu_QrLQghFTvRFxacKzyGhmTio0IlKkfEq-B53qDv9FHN10EqUei8nF2nP8jcdHtL3dk5B7JaBgMKFUsUXYGJ5Fv-w5dB8TJOrrMeM_kvekSEsNTCDzC5-Ngyebhyo3-0EocWt-e5VoT3YBJCFWwg5Acn1K3pP1ZbkC48skCjizlZUC_8nvhyYHxNmwIdyNzCEW1L2zEKq_VK7D8Cz4dyLwc03hAorMfiQ2fUTeBmGqFNYdIMPbiXNG0ADs8ta4u5Sw-vxTdq93dRw9z5E9J8ldlryTWtGf8tVsxPyJ7QpDCaAiF-QCssseacTB8zJnlgIYZBcsuA6odjHMCtI._d_QQxy8ZAW6w3AiKajw7A",
    expires_in: 1800,
    token_type: "Bearer",
  });
});

export const identityProviderServiceHandler = http.post<PathParams, IdpRequestBody>(
  /https:\/\/cognito-idp.\S*.amazonaws.com\//,
  async ({ request }) => {
    console.log("identityProviderServiceHandler called with: ", request);

    const { AccessToken } = await request.json();
    const username = getUsernameFromAccessToken(AccessToken) || process.env.MOCK_USER_USERNAME;
    console.log({ username });

    const target = request.headers.get("x-amz-target");
    if (target == "AWSCognitoIdentityProviderService.InitiateAuth") {
      // {
      //           "name": "x-amz-target",
      //           "value": "AWSCognitoIdentityProviderService.InitiateAuth"
      //         },
      //         {
      //           "name": "x-amz-user-agent",
      //           "value": "aws-amplify/5.0.4 auth framework/0"
      //         }
      return HttpResponse.json({
        AuthenticationResult: {
          AccessToken:
            "eyJraWQiOiJ2VVcrOUdaK1ZPdzZqTlwvaE9PS0J3dkREdG5VR0gweFV1OThcL25cL2VNSXBJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyNDU4NzQwOC1iMGYxLTcwNmMtY2Y1YS0zNmJmY2NiNGI1OGYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIxaTA3azB1dGRsOTJpamUzcDRvbjI3MG5sYiIsIm9yaWdpbl9qdGkiOiI1N2VmYTA0Mi0zYTcxLTRjYzQtYmVmOS1kMzc3MzgxMGNmODIiLCJldmVudF9pZCI6IjVhNjE5Y2Y2LTlmZWUtNDNkOC05YTYzLTFlOGMzYTJiZTFlZSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIGVtYWlsIiwiYXV0aF90aW1lIjoxNzMyNTU4MzQ3LCJleHAiOjE3MzI1NjAxNDcsImlhdCI6MTczMjU1ODM0NywianRpIjoiZWZiNjEwNDYtN2VmMy00N2QxLTlkNTYtY2FmY2Y5YmYzMTVmIiwidXNlcm5hbWUiOiIyNDU4NzQwOC1iMGYxLTcwNmMtY2Y1YS0zNmJmY2NiNGI1OGYifQ.XqaVLk5CYmeCSEMkIZwZGt67l30eZQQHc2uP1rLynhwY0J66KAIOjgpQU1WiLGZ0gt_6m7WWOOEYcXirC-kncFHfMAI0k7pL06ykJIkgM_NcdhFvM2dSMwoBoNn6F61SM-nsFywFhzMV8r_sfcRa_0Vo8CsTJ2xdmTzxvueC4mn4Kc1-oWJBWjFykIfyRrtViIKGfT084_pq2ETH14Vm8jOKpi1JWbhoAOg8PsopCyQJpJJZIv6lcVO8YxaeAPH5Wg-T1e0I7GWGCisBg4mmXNLLh_huVrAKQqlDw8pOZg_KJo2QGRPI44BTYxiXpb2GN1WSOCGWc4r3eZqSwourSQ",
          ExpiresIn: 1800,
          IdToken:
            "eyJraWQiOiIwWUNyR3ducWttMW9BRnhQZCtyY013K2doWTdjNjVET1pEeUdOZlBcL2xscz0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiQkxDcEFUekxqR3dVT1IyaTlyUjhKQSIsInN1YiI6IjI0NTg3NDA4LWIwZjEtNzA2Yy1jZjVhLTM2YmZjY2I0YjU4ZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjQ1ODc0MDgtYjBmMS03MDZjLWNmNWEtMzZiZmNjYjRiNThmIiwib3JpZ2luX2p0aSI6IjU3ZWZhMDQyLTNhNzEtNGNjNC1iZWY5LWQzNzczODEwY2Y4MiIsImF1ZCI6IjFpMDdrMHV0ZGw5MmlqZTNwNG9uMjcwbmxiIiwiZXZlbnRfaWQiOiI1YTYxOWNmNi05ZmVlLTQzZDgtOWE2My0xZThjM2EyYmUxZWUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTczMjU1ODM0NywiZXhwIjoxNzMyNTYwMTQ3LCJpYXQiOjE3MzI1NTgzNDcsImp0aSI6ImZhYjM4ZDZhLTc2MDgtNDdiNy05NDAwLWMzMGYyNmI4Y2MxZSIsImVtYWlsIjoiZ2VvcmdlQGV4YW1wbGUuY29tIn0.eRew7iCav7w6GuTXRaNjLITF5fnVojSSQ59-RJ8IuqdvobnbCWvLdNb4m4VhmHEblefIC5TM222-jApXaziOvrC9A-itnpxUSlrzo52OUtApr-H35cJkLWVdUTge8GcZKgC5WO4JMCV94401U8eT2kcLf_OC3WYp-p31eupNNq2g6DxsJ3ihdbJkmAb6_g1DeSpr-0HwAVROD3o8kbv2nkuJYNi1GpASamtnskc_KFcw_gPNx-nmOFdOoeVHH6jhZRDNJkGMR8yoqtB6KGOrwYdmHNyA9A8Yo0Y959-cLJXeUB6dGKDjaldFxV2XuwI_WwnGhrrvTY52NRXseVcUzA",
          NewDeviceMetadata: {
            DeviceGroupKey: "string3",
            DeviceKey: "string4",
          },
          RefreshToken:
            "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.I-QbqDB-kjzE2lH_ZJwhs0p_zeFuMA5JiVflRWRMVphafzqqTbVmnSD2pUQJjVLM03jy-7MeyoE3fQB8w98yZcfYROpoud7knUkmh0PkuVxDRd8px7rxu9ERU8pXuEdSCsWDpSCoNqvJkSKpzbVJpMOlv9CLcxR4g8ZoNZP6nXj9dP0RH7PyQiOz6McaPdDNRjBcg87YvgxDdbWBtf8x-6j-9T0on6PPfbzxXzshMZ1IIK1mpIWxfLHx1mJx2MO6AKCfVA5BMTLXlZXwsi9F2ybcmD0cpfQY5bZsaPs7uG8LxZLxwcfFqcoyWFpWKIQaPkF__ZganLbTgCvb0T8jew.HlMFcz2Z-OEK8Ibs.mD1LUvQR1X8iq7S0lmo-x5Z89e9x1nSx0o0JcCfctjRUD3dh0xiTJDK3YTB0JSlrUU85kRbTlJdI9S3DDHz2Iz9M8-__OxpsXCWbxCCLu7ki89i8dIAapO8m-HbBhRq0yR8pF-zMh_s9C7sy1RXdKb0xRA5wEEpYDLKSEGQ7a7oklM50zbpuE5G-tczwEASBVx3QqcWJFuevqrEzflc8OrlSQtF4DffYhv7APn8YqANny-5cOsP2oHNA-A_bS73kKVuL4dV_W9YY8XAAcKZ67n722AmNWGsSMlyv0gOiD9LALuE9SeZBPCnaieq0LpK2aDW4aX_OqYCD6lJYnLUYh8uXOfWEX_cQDwB8QpHKykekx2HBolrVCGp_Fe36-wM140zipkTZZbV0FYmxoWuGHqICM_uXgaDYgiwURTE--ReM64X7HMhjhf3mMIHye-VR8pdPDTA4fbdfnQmkcNaHaRxtYSM22CPtRlyIJU6rLJaaxZj8WtJwUCwgECqLhsNr7BKpzl9A_iguFrpFxxKbRh3g1q0xiEukYjDkT0wlsWueDoAdH6_3ovp9HZ5exgATqjFcWZcchpx8Vtir5Xs7FgrgcT3o_ti5O-EDAQsOTuf_8G2JxxqzmB6vb-1JbgaXSKByfJ-cl6B4Y2S2OSiNbf6e0SfEDj_YwOU00UT_kuNzzPLXvWOV9KhpYuzOB-d-MSsQ0E9SAm_VgogdkdG3J-tDCYfGnFINlp6FZxUG8eZjFLp92zpRIW3ET29afqi7wEKgynzhlCghV_2kMTxEirAqqsMdpHYcSEu8bgH0EE4PtJkLgrmVbJUsUwoOfp6t7cWl7wTXU6MNazDp9pCwyU8ywyEH0_A788QwmLtnsxi73vrpCzznrxOyvZfraCBXCyZyTDi9toCbHcAnw-fU--h5Xj0m7a1hgGAvNoDuWk8AZllZozS2GTWavECLw0ipoPtFnj0gzrzk-UQ0T2rv0gnxrFSP39weqbVJxqRpq6tlMCZxhgzWry1ROlXhrK_fEiAirLDHa1O4ZONjgSZNMz7jswCxsIVs3nMVsvUZHmwoOT1L6CokUGBnFA1-151AyCpSe-rI6Pf8r21erb2_CLvUK3unsamfOUHEWYOjsblr_X4GHV9-z_VKaC0j7aO3MQ8u5JAgMKXGg2OEvSRtqMNcJDd7MjhvauGck7kzrVNNwUtoRvZyOBnIQB3956JTZ4WxPOBpcij70YX4x50TMoJQl1SyOvOm3SnRxBOpiXTBZ-LK3gYgsgHs7cvCFORT89CF_U_VHvDNphQ21_p7UsG1TiDvMhrQOTGnnAbAR-SiP1EgjScCYHJc6WtbJCoUcnTet85ujWnfaw9-W2hcxpzyF8aIvXO2FvNrSCU.S2WW_G16EmShrcbZLuPn_A",
          TokenType: "Bearer",
        },
        // AvailableChallenges: ["string7"],
        // ChallengeName: "string8",
        // ChallengeParameters: {
        //   string: "string9",
        // },
        Session:
          "eyJraWQiOiIwWUNyR3ducWttMW9BRnhQZCtyY013K2doWTdjNjVET1pEeUdOZlBcL2xscz0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiQkxDcEFUekxqR3dVT1IyaTlyUjhKQSIsInN1YiI6IjI0NTg3NDA4LWIwZjEtNzA2Yy1jZjVhLTM2YmZjY2I0YjU4ZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjQ1ODc0MDgtYjBmMS03MDZjLWNmNWEtMzZiZmNjYjRiNThmIiwib3JpZ2luX2p0aSI6IjU3ZWZhMDQyLTNhNzEtNGNjNC1iZWY5LWQzNzczODEwY2Y4MiIsImF1ZCI6IjFpMDdrMHV0ZGw5MmlqZTNwNG9uMjcwbmxiIiwiZXZlbnRfaWQiOiI1YTYxOWNmNi05ZmVlLTQzZDgtOWE2My0xZThjM2EyYmUxZWUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTczMjU1ODM0NywiZXhwIjoxNzMyNTYwMTQ3LCJpYXQiOjE3MzI1NTgzNDcsImp0aSI6ImZhYjM4ZDZhLTc2MDgtNDdiNy05NDAwLWMzMGYyNmI4Y2MxZSIsImVtYWlsIjoiZ2VvcmdlQGV4YW1wbGUuY29tIn0.eRew7iCav7w6GuTXRaNjLITF5fnVojSSQ59-RJ8IuqdvobnbCWvLdNb4m4VhmHEblefIC5TM222-jApXaziOvrC9A-itnpxUSlrzo52OUtApr-H35cJkLWVdUTge8GcZKgC5WO4JMCV94401U8eT2kcLf_OC3WYp-p31eupNNq2g6DxsJ3ihdbJkmAb6_g1DeSpr-0HwAVROD3o8kbv2nkuJYNi1GpASamtnskc_KFcw_gPNx-nmOFdOoeVHH6jhZRDNJkGMR8yoqtB6KGOrwYdmHNyA9A8Yo0Y959-cLJXeUB6dGKDjaldFxV2XuwI_WwnGhrrvTY52NRXseVcUzA",
      });
    } else {
      // "name": "x-amz-target",
      //         "value": "AWSCognitoIdentityProviderService.GetUser"

      if (username) {
        // const agent = request.headers.get("x-amz-user-agent");

        // if (agent == "aws-amplify/5.0.4 auth framework/0") {
        // called by Auth.currentAuthenticatedUser

        // } else if (agent == "aws-amplify/5.0.4 auth framework/1") {
        // called by Auth.userAttributes
        const user = findUserByUsername(username);
        if (user) {
          const encodedUser = Buffer.from(JSON.stringify(user)).toString("base64");

          return new HttpResponse(encodedUser, {
            headers: {
              "Content-Type": "application/x-amz-json-1.1",
              "Content-Encoding": "base64",
            },
          });
        }
      }
    }
    return new HttpResponse(null, { status: 404 });
  },
);

export type IdentityRequest = {
  IdentityPoolId: string;
  Logins: Record<string, string>;
};

export const identityServiceHandler = http.post<PathParams, IdentityRequest>(
  /cognito-identity/,
  async ({ request }) => {
    console.log("identity service called with: ", request);
    const target = request.headers.get("x-amz-target");
    if (target) {
      let username;
      const { Logins } = await request.json();
      console.log({ Logins });
      if (Logins?.value) {
        const payload = jwt.decode(Logins.value);
        username = payload?.sub?.toString();
      }
      if (!username) {
        username = process.env.MOCK_USER_USERNAME;
      }

      if (username) {
        // const user = findUserByUsername(username);
        if (target == "AWSCognitoIdentityService.GetId") {
          const encodedId = Buffer.from(
            JSON.stringify({ IdentityId: "us-east-1:93dc1bbb-a9b0-ca1a-3f27-2ee74ba63583" }),
          ).toString("base64");

          // {"IdentityPoolId":"us-east-1:d9eb759d-11cd-4753-84d6-3dfbfc2e24c7","Logins":{"cognito-idp.us-east-1.amazonaws.com/us-east-1_5SRMDsHgJ":"eyJraWQiOiIwWUNyR3ducWttMW9BRnhQZCtyY013K2doWTdjNjVET1pEeUdOZlBcL2xscz0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiN09La0p3Y3dqS1NxbHNGbjBhTkVjQSIsInN1YiI6IjI0NTg3NDA4LWIwZjEtNzA2Yy1jZjVhLTM2YmZjY2I0YjU4ZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV81U1JNRHNIZ0oiLCJjb2duaXRvOnVzZXJuYW1lIjoiMjQ1ODc0MDgtYjBmMS03MDZjLWNmNWEtMzZiZmNjYjRiNThmIiwib3JpZ2luX2p0aSI6IjJiN2UxZGYyLWZjNDYtNDVjYi1hMTY4LWQ0NmEzYTFjNDczZiIsImF1ZCI6IjFpMDdrMHV0ZGw5MmlqZTNwNG9uMjcwbmxiIiwiZXZlbnRfaWQiOiI4ZTA1ODI0MC1hYjIwLTRhYTktODU0OS0xYzYyZGRkM2UzODciLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTczMjU1NDEyOSwiZXhwIjoxNzMyNTU1OTI5LCJpYXQiOjE3MzI1NTQxMjksImp0aSI6IjkzZjhjZTE1LWE5NWEtNDdhNC05OTA3LTQzNDRjM2IxNDg5YiIsImVtYWlsIjoiZ2VvcmdlQGV4YW1wbGUuY29tIn0.SP1L0quGhlitsg3QzfcNKvCx7fsuGzLkeiOekXR6GOKTH38uvU2edOFNjiAd4WDVfQlAZJGpFGvaLxJt8VfH_npa9YJzu2QtwUx7hNrFPQU5MNMKz4wIZTWqKGSrOMQCyx3I9T3eZReAvXvShlzSOSMncuvDv0ncwvTLOEqdukdq6bCXQq1X4qlGLRUoue2pz9-ClBzjFQF0S8aulSkWpOODeDOrMOeySroRaYe5OLSYv-5_tkZARLXuECSUY0fkor16qLgXRLUIVI-v_iB21U-xUeNCnS3sECn74UApqCVguVPXXLwPma_y5GCsqYAfK3B22V8NKIaZ88OPEmTekg"}}

          return new HttpResponse(encodedId, {
            headers: {
              "Content-Type": "application/x-amz-json-1.1",
              "Content-Encoding": "base64",
            },
          });
        } else if (target == "AWSCognitoIdentityService.GetCredentialsForIdentity") {
          return new HttpResponse(
            "eyJDcmVkZW50aWFscyI6eyJBY2Nlc3NLZXlJZCI6IkFTSUFaSFhBM1hPVVJBSENLUFVEIiwiRXhwaXJhdGlvbiI6MS43MzI1NTgzNjNFOSwiU2VjcmV0S2V5IjoiUjNlUE9UbzE1eVArTTRXNE4wbHFlVHd4UEtFOVk0Qm1kMDRHZ1AvLyIsIlNlc3Npb25Ub2tlbiI6IklRb0piM0pwWjJsdVgyVmpFSElhQ1hWekxXVmhjM1F0TVNKSE1FVUNJUUNhQWNTSkVHZGxJbXFVT0JCeElWRFV4cUlmSzNFbVRJcDdvQ0kzSmRJVzd3SWdVWHg5QlhyVER6bUN3MFJ5SURTaWllUjRmcDdMdldQbHorOVYxcFlMN0lNcXhBUUlHaEFCR2d3Mk16VXdOVEk1T1RjMU5EVWlERVo3Ums4WkFIRE1SekxTRHlxaEJNTHpWVUt6TUpZaVVNK2xPc3lBeHVrK016VDU2STExNUkzdDdZUU00N0JQRGlqSitiVXJld0ZUdUhSYnVyZWhhUWF1eTNkZi9EY05nM3crQkdqMnFEL3ZUaDdLQkJWYWFIQ1dkMm5hMGtla2hjUW4reE9zNklmL2VSZ2hEUkFmQ2hUL2lTclNtSFBEbUlUVVAvSkZoVExBdWFVQmg0bFhyeGs1eVNjamRmQ0ZwL1RqNTY1NGw3b3p3eUJEVENVQkZOakNHNmYxaUROdllvZm56WDlKSG9peXluemgvRHlZZU15YkJOenpxWFpGWktLNTIxWDlRdGNKQ3FrSkQwYlBuSnJQdUN6VEdDRkxQSlBqM01DUllremJrTHN3SlEvVjJoeXBmdGp0MXAzb3BobjFydmVaM3NsdXFaNzJpejBVa2JjZUVYbE5vR0pGamhDcGtOM0RUckh0NVgwY2ZjTDJqVEorL3RJQ0lqM2RBK0piRjhSbDBlblNjaG9ubC8waXpUaWZib0R2VTZlSDFhK1BMaFBYek5XZlB4Q2hUWlJoYU8wRWkzNFBIMnlRd1RMcERTRHcvTm92eVFBTlk4Nm1qRkl6eDRuN0ZwaGFETXNXbzlLcFpvditwbWptTEhnOGhYQmZKQlUzUFV1RlgwaG5CWnc2VXd3NVorSC9WYmsyQmk3dHRqQUZQU3ZIYkhUT3daZU9teXFFNmsvQjhDNzJkOXVLRW5PM0pRRFg5eGFhNDZLR0xsQXlSZnR2L3B6dGdGZWRpaVJJTkx0TnFKNU9MaEd6VzBDb3BZWGhwa1hVMlA5UEpKbjhreFlSYmFGV2FCS1BqYmV3K051RHJ2MmJwalJsRkpMMmdneENTcWVSUWJPc25tcitOY1hOM2k5SXUrZVJsZEhJQVFvVFVxcVJHTk5tUTBMWmlTcGVxUFpOMStheUJoanJmVXI4Ujg4R3ZadW9UOXdKTUl2Z2tyb0dPb1VDaFpNRE5XTHNVOU9GcmpQQlhtd2x1eVRSMjJRY1FObFZEQ3J2empMWGExUVhhejZ4WG02MktwZlljN0ZNZVMxS0dnQ1dROEVrR2ZpZzZhZ0RoWlFISSs1andtL2hsYTl0Vm10RFlsaExIcHZ3bmV3UnBIZktOVlZJbWRxeHYweWtZNG5tVTVLRHVTdnpmY01ra21rS3p4MWhKbmN4WTFPbVFGbDNOamZsazNqQmdaZ3FpcDJzbDZwcVduOUdkU1pFTXZ1WVZzVkkwcHFhWEdJemlqRUp1OFV6dnI4YWxPL2hNSmlCZElYSHZjem9IdjZkODhhdXJWaGwxTEovc2lqS2dpWWN6eGZtMG84WTIvNjdSNlQwaG5WeWs0aitGbjNhdTJicG1zcWlGcGFmT2FpRUxIOWZua1UyNjZKNFdhZVFGaGQ4M1JaMEQxK0FveEVaalhlZ25QUHNrNmlIIn0sIklkZW50aXR5SWQiOiJ1cy1lYXN0LTE6OTNkYzFiYmItYTliMC1jYTFhLTNmMjctMmVlNzRiYTYzNTgzIn0=",
            {
              headers: {
                "Content-Type": "application/x-amz-json-1.1",
                "Content-Encoding": "base64",
              },
            },
          );
          // } else {
          //   console.error(`x-amz-target ${target} not handled`);
          //   return passthrough();
        }
      }
    }
    console.error("x-amz-target not present");
    return passthrough();
  },
);

export const defaultHandlers = [
  signInHandler,
  identityProviderServiceHandler,
  identityServiceHandler,
];

// cognito - idp = eyJVc2VyQXR0cmlidXRlcyI6W3siTmFtZSI6ImVtYWlsIiwiVmFsdWUiOiJnZW9yZ2VAZXhhbXBsZS5jb20ifSx7Ik5hbWUiOiJlbWFpbF92ZXJpZmllZCIsIlZhbHVlIjoidHJ1ZSJ9LHsiTmFtZSI6ImZhbWlseV9uYW1lIiwiVmFsdWUiOiJIYXJyaXNvbiJ9LHsiTmFtZSI6ImdpdmVuX25hbWUiLCJWYWx1ZSI6Ikdlb3JnZSJ9LHsiTmFtZSI6ImN1c3RvbTpzdGF0ZSIsIlZhbHVlIjoiVkEsT0gsU0MsQ08sR0EsTUQifSx7Ik5hbWUiOiJjdXN0b206Y21zLXJvbGVzIiwiVmFsdWUiOiJvbmVtYWMtbWljcm8tc3RhdGVzdWJtaXR0ZXIifSx7Ik5hbWUiOiJzdWIiLCJWYWx1ZSI6ImM0MDg3NDQ4LWQwZTEtNzBjMS0zZDc0LTRmOGJkMWZhMTNmZCJ9XSwiVXNlcm5hbWUiOiJjNDA4NzQ0OC1kMGUxLTcwYzEtM2Q3NC00ZjhiZDFmYTEzZmQifQ==
// {
//   "UserAttributes": [
//     {
//       "Name": "email",
//       "Value": "george@example.com"
//     },
//     {
//       "Name": "email_verified",
//       "Value": "true"
//     },
//     {
//       "Name": "family_name",
//       "Value": "Harrison"
//     },
//     {
//       "Name": "given_name",
//       "Value": "George"
//     },
//     {
//       "Name": "custom:state",
//       "Value": "VA,OH,SC,CO,GA,MD"
//     },
//     {
//       "Name": "custom:cms-roles",
//       "Value": "onemac-micro-statesubmitter"
//     },
//     {
//       "Name": "sub",
//       "Value": "c4087448-d0e1-70c1-3d74-4f8bd1fa13fd"
//     }
//   ],
//   "Username": "c4087448-d0e1-70c1-3d74-4f8bd1fa13fd"
// }

// cognito - identity = eyJJZGVudGl0eUlkIjoidXMtZWFzdC0xOjkzZGMxYmJiLWE5OTEtYzhiOC1lZWZhLThjYTZhZDMwYmYxYSJ9
// {
//   "IdentityId": "us-east-1:93dc1bbb-a991-c8b8-eefa-8ca6ad30bf1a"
// }

// eyJDcmVkZW50aWFscyI6eyJBY2Nlc3NLZXlJZCI6IkFTSUFaSFhBM1hPVTVINVJDR1dCIiwiRXhwaXJhdGlvbiI6MS43MzIxMTY2NzJFOSwiU2VjcmV0S2V5Ijoickpia09MUnR3UnFXaFlRYnh4cG53SGsxV2xHdWZsanM1dlJOK3BaRyIsIlNlc3Npb25Ub2tlbiI6IklRb0piM0pwWjJsdVgyVmpFUGYvLy8vLy8vLy8vd0VhQ1hWekxXVmhjM1F0TVNKSU1FWUNJUUN0MDUzTmFhRXFKWXZkZW95bWtaK2Y3Q1dWRXN3RWZlZGhVR042S1o2NzFBSWhBTEphc2tMREIwdm04emVXNUxuVXBJc3VQOFRzeDB2QnhyNHNOVHdOVnYrbktzMEVDSkQvLy8vLy8vLy8vd0VRQVJvTU5qTTFNRFV5T1RrM05UUTFJZ3lmSTJubS85S05ybUIxNnQwcW9RU0wvVndDa28vWldvRExjRjZOUVZGaFlpeFBxeGV4Yit4UENGbzU1L0xJam95TGpqaWFCNWhBU1dvTnpJWmlMeldHMkpOQlJHWDFMSG42SnowMS9BVXdYWWJRRE9jTlNFTmF2TzF6c0xaZllETUhCZjRoc1E2Z3I2M09xQVI1UUtXYUpXU1U1VDFmdU04OTQ5Y1RyY1l2QWZPK0oyUXAvZTZyOHFyRzA5ckFPVUg1UFdZbERYMzNCRk5lSlFoalVOSnd6bjVOMzFTTnhCUDVybDcyRnVzL3dRMUI4dlVxWmxQUE5HV3dMTUk5bnYwblZoRmZPalRNUzFaNFFNZ3dIb2ZLOTgwY2tuMjdVeHdhcGg3aTdpZUhYdHFaeTZ0akRpd0RFREhLd1B2cW5FN0FiNUkxdWQ2M3dlS1Zkd1l4b1B3WlJpd05iU0EwZXFrZFRhR2dwa3BSNitmcFRoOTRhOVlYZU5DODZXcmVROVBMeHlFVUR5MnJrVlJUVzhGMmVWTDhsZ1R0RFZLdjFBMk5UMm13dmZNams4N2NyMHBrTklwU1luUlhybXhOVGM3ZU9qS2FSVVBnQkVqclFkd3J1bW9wMVpxZk12OVA3YWozY1MwRjN5cjBXNlNVaVJwbXRTY1JJU2pQeXpDOHdwKzhqQTdaTGZHSkNrUFhQeitxbHVQZW5IMmRoUkptQ3pHUkcwY3Zoc2hlb2JOOGR6SzRvYlpCMmhUbFBJb2lDMWk5TGVqVFBTNlZ3eDl2Wm1nQXdyR2xNSU92dVZyVHlOMDBoekNFS3FzYnlyZGdMMStMT1F6Q3VsWGc4VnZBVGVQRHBiZ2JnUEEvR3JDMVhPeTVaTHlGV05ETmQwcThpN2ZrWUpMNmN2ZkVGWS9yaHFBaVEwSHVHVnhLay9aeGJ6TnBXWUFMeWo0WTZKa3JLTjlNVDlzVkFqeVRob3FndXhPME1uckUzeXdUbGpDdzVmZTVCanFFQWpLZDFyMFM3TEMvY1JlbFJIYjNRMnN4SkgrbDk4ME9Ec25ZYWJBSmZvQVJkbHM5TnpBTmQ0TmxFSDVjL3lBTC8vb3ovNmFtU2tMV1IvTGJCM3Y4d3RPUVdYeUJjOEk0TExNVEdLNGZtSWJ4UyszUXBZRnN4ZTZXYXUzOTF5bUo5S1pQNjNQQzVpM0t2cE1WZ0gxa21vaUlYWHVRa1Y5bEJPVmtYdHIrZ29GQ3FxeFF6OERjdHRqNHRhbGpMY3NITGJHQVBpSEVDZllUazNOOHFJeXBZbmQwOVA5RnFRdURoMTNxeUlqN1NKRWx3LzVUVS8xaEsvSWFldzcrREtBWFAyUm5XejFBZCsvRnREd25pWjdxVXlkK2wwQjRjeERmTng0MndpQTJaM1ZQU3lpZW9INUpib1NCY0lmZldrbTdBc2RSMkFINEluK1hLTVh1NGlXS2FYTysrY0xEIn0sIklkZW50aXR5SWQiOiJ1cy1lYXN0LTE6OTNkYzFiYmItYTk5MS1jOGI4LWVlZmEtOGNhNmFkMzBiZjFhIn0=
