import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./manageUsers"; // Adjust the path as necessary
import * as cfnResponse from "cfn-response-async";
import * as cognitolib from "./cognito-lib";
import { getSecret } from "shared-utils";

vi.mock("cfn-response-async");
vi.mock("./cognito-lib");
vi.mock("shared-utils");

describe("Cognito User Lambda Handler", () => {
  const mockSend = vi.fn();
  const mockGetSecret = vi.fn();
  const mockCreateUser = vi.fn();
  const mockSetPassword = vi.fn();
  const mockUpdateUserAttributes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (cfnResponse.send as unknown as typeof mockSend).mockImplementation(
      mockSend,
    );
    (getSecret as unknown as typeof mockGetSecret).mockImplementation(
      mockGetSecret,
    );
    (
      cognitolib.createUser as unknown as typeof mockCreateUser
    ).mockImplementation(mockCreateUser);
    (
      cognitolib.setPassword as unknown as typeof mockSetPassword
    ).mockImplementation(mockSetPassword);
    (
      cognitolib.updateUserAttributes as unknown as typeof mockUpdateUserAttributes
    ).mockImplementation(mockUpdateUserAttributes);
  });

  it("should create, set password, and update attributes for each user on Create or Update", async () => {
    const event = {
      RequestType: "Create",
      ResourceProperties: {
        userPoolId: "userPoolId",
        users: [
          {
            username: "user1",
            attributes: [
              {
                Name: "email",
                Value: "user1@example.com",
              },
            ],
          },
        ],
        passwordSecretArn: "passwordSecretArn", // pragma: allowlist secret
      },
    };

    const context = {};

    mockGetSecret.mockResolvedValue("devUserPassword");
    mockSend.mockResolvedValue(undefined);
    mockCreateUser.mockResolvedValue(undefined);
    mockSetPassword.mockResolvedValue(undefined);
    mockUpdateUserAttributes.mockResolvedValue(undefined);

    await handler(event, context);

    expect(mockGetSecret).toHaveBeenCalledWith("passwordSecretArn");
    expect(mockCreateUser).toHaveBeenCalledWith({
      UserPoolId: "userPoolId",
      Username: "user1",
      UserAttributes: [
        {
          Name: "email",
          Value: "user1@example.com",
        },
      ],
      MessageAction: "SUPPRESS",
    });
    expect(mockSetPassword).toHaveBeenCalledWith({
      Password: "devUserPassword", // pragma: allowlist secret
      UserPoolId: "userPoolId",
      Username: "user1",
      Permanent: true,
    });
    expect(mockUpdateUserAttributes).toHaveBeenCalledWith({
      Username: "user1",
      UserPoolId: "userPoolId",
      UserAttributes: [
        {
          Name: "email",
          Value: "user1@example.com",
        },
      ],
    });
    expect(mockSend).toHaveBeenCalledWith(
      event,
      context,
      "SUCCESS",
      {},
      "static",
    );
  });

  it("should handle errors and send FAILED response", async () => {
    const event = {
      RequestType: "Create",
      ResourceProperties: {
        userPoolId: "userPoolId",
        users: [
          {
            username: "user1",
            attributes: [
              {
                Name: "email",
                Value: "user1@example.com",
              },
            ],
          },
        ],
        passwordSecretArn: "passwordSecretArn", // pragma: allowlist secret
      },
    };

    const context = {};

    mockGetSecret.mockRejectedValue(new Error("Failed to get secret"));
    mockSend.mockResolvedValue(undefined);

    await handler(event, context);

    expect(mockGetSecret).toHaveBeenCalledWith("passwordSecretArn"); // pragma: allowlist secret
    expect(mockSend).toHaveBeenCalledWith(
      event,
      context,
      "FAILED",
      {},
      "static",
    );
  });
});
