import { http, HttpResponse } from "msw";

const defaultApiTokenHandler = http.put(/\/api\/token$/, ({ request }) => {
  console.log("defaultApiTokenHandler: ", JSON.stringify(request));
  return new HttpResponse();
});

const defaultSecurityCredentialsHandler = http.get(
  /\/meta-data\/iam\/security-credentials$/,
  ({ request }) => {
    console.log("defaultSecurityCredentialsHandler: ", JSON.stringify(request));
    return new HttpResponse();
  },
);

export const defaultHandlers = [defaultApiTokenHandler, defaultSecurityCredentialsHandler];
