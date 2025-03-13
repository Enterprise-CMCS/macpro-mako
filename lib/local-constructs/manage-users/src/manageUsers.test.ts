import {
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { Context } from "aws-lambda";
import * as cfn from "cfn-response-async";
import {
  CLOUDFORMATION_NOTIFICATION_DOMAIN,
  TEST_PW_ARN,
  TEST_SECRET_ERROR_ID,
  testNewStateSubmitter,
  USER_POOL_ID,
} from "mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./manageUsers"; // Adjust the path as necessary

describe("Cognito User Lambda Handler", () => {
  const cognitoSpy = vi.spyOn(CognitoIdentityProviderClient.prototype, "send");
  const cfnSpy = vi.spyOn(cfn, "send");
  const callback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create, set password, and update attributes for each user on Create or Update", async () => {
    const event = {
      ResponseURL: CLOUDFORMATION_NOTIFICATION_DOMAIN,
      RequestType: "Create",
      ResourceProperties: {
        userPoolId: USER_POOL_ID,
        users: [
          {
            username: testNewStateSubmitter.Username,
            attributes: testNewStateSubmitter.UserAttributes,
          },
        ],
        passwordSecretArn: TEST_PW_ARN,
      },
    };

    await handler(event, {} as Context, callback);

    expect(cognitoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          UserPoolId: USER_POOL_ID,
          Username: testNewStateSubmitter.Username,
          UserAttributes: testNewStateSubmitter.UserAttributes,
          MessageAction: "SUPPRESS",
        },
      } as AdminCreateUserCommand),
    );
    expect(cognitoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Password: "devUserPassword", // pragma: allowlist secret
          UserPoolId: USER_POOL_ID,
          Username: testNewStateSubmitter.Username,
          Permanent: true,
        },
      } as AdminSetUserPasswordCommand),
    );
    expect(cognitoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          UserPoolId: USER_POOL_ID,
          Username: testNewStateSubmitter.Username,
        },
      } as AdminGetUserCommand),
    );
    expect(cognitoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Username: testNewStateSubmitter.Username,
          UserPoolId: USER_POOL_ID,
          UserAttributes: testNewStateSubmitter.UserAttributes,
        },
      } as AdminUpdateUserAttributesCommand),
    );
    expect(cognitoSpy).toHaveBeenCalledTimes(4);
    expect(cfnSpy).toHaveBeenCalledWith(event, {}, cfn.SUCCESS, {}, "static");
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle errors and send FAILED response", async () => {
    const event = {
      ResponseURL: CLOUDFORMATION_NOTIFICATION_DOMAIN,
      RequestType: "Create",
      ResourceProperties: {
        userPoolId: USER_POOL_ID,
        users: [
          {
            username: testNewStateSubmitter.Username,
            attributes: testNewStateSubmitter.UserAttributes,
          },
        ],
        passwordSecretArn: TEST_SECRET_ERROR_ID,
      },
    };

    await handler(event, {} as Context, callback);

    expect(cognitoSpy).not.toHaveBeenCalled();
    expect(cfnSpy).toHaveBeenCalledWith(event, {}, cfn.FAILED, {}, "static");
    expect(callback).toHaveBeenCalledWith(expect.any(Error), { statusCode: 500 });
  });
});
