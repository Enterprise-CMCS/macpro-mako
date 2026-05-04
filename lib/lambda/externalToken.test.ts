import { scryptSync } from "node:crypto";

import { APIGatewayProxyEvent } from "aws-lambda";
import * as sharedUtils from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetExternalApiAuthConfigCache } from "./external-auth";
import { handler } from "./externalToken";

vi.mock("shared-utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("shared-utils")>();
  return {
    ...original,
    getSecret: vi.fn(),
  };
});

function createMockExternalAuthSecret() {
  const salt = Buffer.from("external-client-salt");
  const secretHash = scryptSync("correct-secret", salt, 64);
  return JSON.stringify({
    jwtSigningSecretHex: Buffer.alloc(32, 3).toString("hex"),
    issuer: "mako-external-oauth",
    clients: [
      {
        clientId: "partner-app",
        status: "ACTIVE",
        grants: ["client_credentials"],
        secretSalt: salt.toString("base64"),
        secretHash: secretHash.toString("base64"),
        allowedLocations: [{ bucket: "attachments-bucket", prefix: "" }],
      },
    ],
  });
}

function createEvent(body: string, contentType: string): APIGatewayProxyEvent {
  return {
    body,
    headers: { "Content-Type": contentType },
  } as unknown as APIGatewayProxyEvent;
}

describe("externalToken handler", () => {
  beforeEach(() => {
    process.env.externalApiAuthSecretArn =
      "arn:aws:secretsmanager:us-east-1:123456789012:secret:test-external-auth";
    vi.mocked(sharedUtils.getSecret).mockResolvedValue(createMockExternalAuthSecret());
    resetExternalApiAuthConfigCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetExternalApiAuthConfigCache();
  });

  it("returns an access token for valid JSON client credentials", async () => {
    const result = await handler(
      createEvent(
        JSON.stringify({
          grant_type: "client_credentials",
          client_id: "partner-app",
          client_secret: "correct-secret", // pragma: allowlist secret
        }),
        "application/json",
      ),
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toBeTruthy();
    const parsedBody = JSON.parse(result.body);
    expect(parsedBody.token_type).toBe("Bearer");
    expect(parsedBody.expires_in).toBe(1800);
    expect(typeof parsedBody.access_token).toBe("string");
    expect(parsedBody.access_token.length).toBeGreaterThan(10);
  });

  it("returns an access token for valid form-encoded client credentials", async () => {
    const result = await handler(
      createEvent(
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: "partner-app",
          client_secret: "correct-secret", // pragma: allowlist secret
        }).toString(),
        "application/x-www-form-urlencoded",
      ),
    );

    expect(result.statusCode).toBe(200);
    const parsedBody = JSON.parse(result.body);
    expect(parsedBody.token_type).toBe("Bearer");
    expect(parsedBody.expires_in).toBe(1800);
    expect(typeof parsedBody.access_token).toBe("string");
  });

  it("returns 400 for unsupported grant types", async () => {
    const result = await handler(
      createEvent(
        JSON.stringify({
          grant_type: "authorization_code",
          client_id: "partner-app",
          client_secret: "correct-secret", // pragma: allowlist secret
        }),
        "application/json",
      ),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(
      JSON.stringify({
        error: "unsupported_grant_type",
        error_description: "Only client_credentials is supported.",
      }),
    );
  });

  it("returns 401 for invalid client credentials", async () => {
    const result = await handler(
      createEvent(
        JSON.stringify({
          grant_type: "client_credentials",
          client_id: "partner-app",
          client_secret: "wrong-secret", // pragma: allowlist secret
        }),
        "application/json",
      ),
    );

    expect(result.statusCode).toBe(401);
    expect(result.body).toEqual(
      JSON.stringify({
        error: "invalid_client",
        error_description: "Invalid client credentials.",
      }),
    );
  });

  it("returns 400 for malformed JSON", async () => {
    const result = await handler(createEvent("{not valid json}", "application/json"));
    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(
      JSON.stringify({
        error: "invalid_request",
        error_description: "Invalid JSON payload.",
      }),
    );
  });

  it("returns 400 when content type is unsupported", async () => {
    const result = await handler(
      createEvent(
        JSON.stringify({
          grant_type: "client_credentials",
          client_id: "partner-app",
          client_secret: "correct-secret", // pragma: allowlist secret
        }),
        "text/plain",
      ),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(
      JSON.stringify({
        error: "invalid_request",
        error_description:
          "Content-Type must be application/json or application/x-www-form-urlencoded.",
      }),
    );
  });

  it("returns 500 when auth secret cannot be loaded", async () => {
    vi.mocked(sharedUtils.getSecret).mockRejectedValueOnce(new Error("boom"));
    resetExternalApiAuthConfigCache();

    const result = await handler(
      createEvent(
        JSON.stringify({
          grant_type: "client_credentials",
          client_id: "partner-app",
          client_secret: "correct-secret", // pragma: allowlist secret
        }),
        "application/json",
      ),
    );

    expect(result.statusCode).toBe(500);
    expect(result.body).toEqual(
      JSON.stringify({
        error: "server_error",
        error_description: "Internal server error.",
      }),
    );
  });
});
