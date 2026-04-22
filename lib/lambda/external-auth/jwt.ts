import { createHmac, timingSafeEqual } from "node:crypto";

import { CLIENT_CREDENTIALS_GRANT, TOKEN_EXPIRATION_SECONDS } from "./constants";
import { ExternalAccessTokenClaims, ExternalApiAuthConfig, ExternalApiClient } from "./types";

type JwtHeader = {
  alg: "HS256";
  typ: "JWT";
};

function toBase64Url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function parseJsonBase64Url<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function createExternalAccessToken(
  config: ExternalApiAuthConfig,
  client: ExternalApiClient,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: ExternalAccessTokenClaims = {
    iss: config.issuer,
    sub: client.clientId,
    client_id: client.clientId,
    grant_type: CLIENT_CREDENTIALS_GRANT,
    grants: client.grants,
    token_use: "access",
    iat: now,
    exp: now + TOKEN_EXPIRATION_SECONDS,
  };

  const header: JwtHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", config.jwtSigningKey).update(signingInput).digest();

  return `${signingInput}.${toBase64Url(signature)}`;
}

export function verifyExternalAccessToken(
  token: string,
  config: ExternalApiAuthConfig,
): ExternalAccessTokenClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseJsonBase64Url<JwtHeader>(encodedHeader);
  if (!header || header.alg !== "HS256" || header.typ !== "JWT") {
    return null;
  }

  const expectedSignature = createHmac("sha256", config.jwtSigningKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  let providedSignature: Buffer;
  try {
    providedSignature = Buffer.from(encodedSignature, "base64url");
  } catch {
    return null;
  }

  if (expectedSignature.length !== providedSignature.length) {
    return null;
  }

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }

  const payload = parseJsonBase64Url<ExternalAccessTokenClaims>(encodedPayload);
  if (!payload) {
    return null;
  }

  if (
    payload.iss !== config.issuer ||
    payload.grant_type !== CLIENT_CREDENTIALS_GRANT ||
    payload.token_use !== "access"
  ) {
    return null;
  }

  if (
    typeof payload.client_id !== "string" ||
    payload.client_id.trim() === "" ||
    typeof payload.sub !== "string" ||
    payload.sub.trim() === "" ||
    !Array.isArray(payload.grants) ||
    payload.grants.some((grant) => typeof grant !== "string")
  ) {
    return null;
  }

  if (typeof payload.exp !== "number" || typeof payload.iat !== "number") {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return null;
  }

  return payload;
}
