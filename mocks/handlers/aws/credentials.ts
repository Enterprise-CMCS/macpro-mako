import { http, HttpResponse } from "msw";
import { ACCESS_KEY_ID, SECRET_KEY } from "../../consts";

const generateSessionToken = (): string | null => {
  if (process.env.MOCK_USER_USERNAME) {
    return Buffer.from(JSON.stringify({ username: process.env.MOCK_USER_USERNAME })).toString(
      "base64",
    );
  }
  return null;
};

const defaultApiTokenHandler = http.put(/\/api\/token/, ({ request }) => {
  console.log("defaultApiTokenHandler", { request, headers: request.headers });
  return HttpResponse.text(generateSessionToken());
});

const defaultSecurityCredentialsHandler = http.get(
  /\/meta-data\/iam\/security-credentials/,
  ({ request }) => {
    console.log("defaultSecurityCredentialsHandler", { request, headers: request.headers });
    return HttpResponse.json({
      Code: "Success",
      LastUpdated: new Date().toISOString(),
      Type: "AWS-HMAC",
      AccessKeyId: ACCESS_KEY_ID,
      SecretAccessKey: SECRET_KEY,
      Token: generateSessionToken(),
      Expiration: "2017-05-17T15:09:54Z",
    });
  },
);

const defaultSecurityTokenServiceHandler = http.post(
  "https://sts.us-east-1.amazonaws.com/",
  ({ request }) => {
    console.log("defaultSecurityTokenServiceHandler", { request, headers: request.headers });
    const xmlResponse = `
  <AssumeRoleResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/">
    <AssumeRoleResult>
      <SourceIdentity>DevUser123</SourceIdentity>
      <Credentials>
        <SessionToken>${generateSessionToken()}</SessionToken>
        <SecretAccessKey>${SECRET_KEY}</SecretAccessKey>
        <Expiration>2019-07-15T23:28:33.359Z</Expiration>
        <AccessKeyId>${ACCESS_KEY_ID}</AccessKeyId>
      </Credentials>
      <AssumedRoleUser>
        <Arn>arn:aws:sts::123456789012:assumed-role/demo/John</Arn>
        <AssumedRoleId>ARO123EXAMPLE123:John</AssumedRoleId>
      </AssumedRoleUser>
      <PackedPolicySize>8</PackedPolicySize>
    </AssumeRoleResult>
    <ResponseMetadata>
      <RequestId>c6104cbe-af31-11e0-8154-cbc7ccf896c7</RequestId>
    </ResponseMetadata>
  </AssumeRoleResponse>
`;

    return HttpResponse.xml(xmlResponse);
  },
);

export const errorSecurityTokenServiceHandler = http.post(
  "https://sts.us-east-1.amazonaws.com/",
  async () =>
    HttpResponse.xml(
      `
<Error>
  <Code>ServiceUnavailable</Code>
  <Message>Service is unable to handle request.</Message>
</Error>
    `,
      {
        status: 503,
        statusText: "ServiceUnavailable",
      },
    ),
);

export const credentialHandlers = [
  defaultApiTokenHandler,
  defaultSecurityCredentialsHandler,
  defaultSecurityTokenServiceHandler,
];
