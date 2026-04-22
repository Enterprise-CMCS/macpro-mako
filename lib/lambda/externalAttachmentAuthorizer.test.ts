import { scryptSync } from "node:crypto";

import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import * as sharedUtils from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getExternalApiAuthConfig, issueClientCredentialsAccessToken } from "./external-auth";
import { resetExternalApiAuthConfigCache } from "./external-auth/config";
import { createExternalAccessToken } from "./external-auth/jwt";
import { handler } from "./externalAttachmentAuthorizer";

vi.mock("shared-utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("shared-utils")>();
  return {
    ...original,
    getSecret: vi.fn(),
  };
});

function createMockExternalAuthSecret() {
  const salt = Buffer.from("external-client-salt");
  const activeSecretHash = scryptSync("correct-secret", salt, 64);
  const inactiveSecretHash = scryptSync("disabled-secret", salt, 64);

  return JSON.stringify({
    jwtSigningSecretHex: Buffer.alloc(32, 7).toString("hex"),
    issuer: "mako-external-oauth",
    clients: [
      {
        clientId: "partner-app",
        status: "ACTIVE",
        grants: ["client_credentials"],
        secretSalt: salt.toString("base64"),
        secretHash: activeSecretHash.toString("base64"),
        allowedLocations: [{ bucket: "attachments-bucket", prefix: "" }],
      },
      {
        clientId: "disabled-client",
        status: "INACTIVE",
        grants: ["client_credentials"],
        secretSalt: salt.toString("base64"),
        secretHash: inactiveSecretHash.toString("base64"),
        allowedLocations: [{ bucket: "attachments-bucket", prefix: "" }],
      },
    ],
  });
}

function createEvent(authorizationToken: string): APIGatewayTokenAuthorizerEvent {
  return {
    type: "TOKEN",
    authorizationToken,
    methodArn:
      "arn:aws:execute-api:us-east-1:123456789012:api-id/dev/POST/external/getAttachmentUrl",
  };
}

describe("externalAttachmentAuthorizer handler", () => {
  beforeEach(() => {
    process.env.externalApiAuthSecretArn =
      "arn:aws:secretsmanager:us-east-1:123456789012:secret:test-external-auth";
    vi.mocked(sharedUtils.getSecret).mockResolvedValue(createMockExternalAuthSecret());
    resetExternalApiAuthConfigCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    resetExternalApiAuthConfigCache();
  });

  it("returns Allow policy for valid access token", async () => {
    const tokenResult = await issueClientCredentialsAccessToken("partner-app", "correct-secret");
    expect(tokenResult).toBeTruthy();

    const rawResult = await handler(
      createEvent(`Bearer ${tokenResult!.accessToken}`),
      {} as any,
      vi.fn(),
    );
    expect(rawResult).toBeTruthy();
    const result = rawResult as Exclude<typeof rawResult, void>;

    expect(result.policyDocument.Statement[0].Effect).toBe("Allow");
    expect(result.principalId).toBe("partner-app");
    expect(result.context).toEqual({
      clientId: "partner-app",
      grants: "client_credentials",
      isOAuthClient: "true",
    });
  });

  it("returns Deny policy for expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const tokenResult = await issueClientCredentialsAccessToken("partner-app", "correct-secret");
    expect(tokenResult).toBeTruthy();

    vi.setSystemTime(new Date("2026-01-01T00:31:00Z"));
    const rawResult = await handler(
      createEvent(`Bearer ${tokenResult!.accessToken}`),
      {} as any,
      vi.fn(),
    );
    expect(rawResult).toBeTruthy();
    const result = rawResult as Exclude<typeof rawResult, void>;

    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("returns Deny policy for token with invalid signature", async () => {
    const tokenResult = await issueClientCredentialsAccessToken("partner-app", "correct-secret");
    expect(tokenResult).toBeTruthy();

    const invalidToken = `${tokenResult!.accessToken.slice(0, -1)}x`;
    const rawResult = await handler(createEvent(`Bearer ${invalidToken}`), {} as any, vi.fn());
    expect(rawResult).toBeTruthy();
    const result = rawResult as Exclude<typeof rawResult, void>;

    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("returns Deny policy for inactive clients", async () => {
    const config = await getExternalApiAuthConfig();
    const disabledClient = config.clients.find((client) => client.clientId === "disabled-client");
    expect(disabledClient).toBeTruthy();

    const token = createExternalAccessToken(config, disabledClient!);
    const rawResult = await handler(createEvent(`Bearer ${token}`), {} as any, vi.fn());
    expect(rawResult).toBeTruthy();
    const result = rawResult as Exclude<typeof rawResult, void>;

    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });
});
