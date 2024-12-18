import { http, HttpResponse } from "msw";
import { ACCESS_KEY_ID, SECRET_KEY } from "../consts";

const generateSessionToken = (): string | null => {
  if (process.env.MOCK_USER_USERNAME) {
    return Buffer.from(JSON.stringify({ username: process.env.MOCK_USER_USERNAME })).toString(
      "base64",
    );
  }
  return null;
};

const defaultApiTokenHandler = http.put(/\/api\/token/, () => {
  return HttpResponse.text(generateSessionToken());
});

const defaultSecurityCredentialsHandler = http.get(/\/meta-data\/iam\/security-credentials/, () => {
  return HttpResponse.json({
    Code: "Success",
    LastUpdated: new Date().toISOString(),
    Type: "AWS-HMAC",
    AccessKeyId: ACCESS_KEY_ID,
    SecretAccessKey: SECRET_KEY,
    Token: generateSessionToken(),
    Expiration: "2017-05-17T15:09:54Z",
  });
});

export const defaultHandlers = [defaultApiTokenHandler, defaultSecurityCredentialsHandler];
