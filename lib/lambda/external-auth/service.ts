import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { getActiveClient, getExternalApiAuthConfig } from "./config";
import { CLIENT_CREDENTIALS_GRANT } from "./constants";
import { createExternalAccessToken, verifyExternalAccessToken } from "./jwt";
import { ExternalAccessTokenClaims, ExternalApiAuthConfig, ExternalApiClient } from "./types";

const scrypt = promisify(scryptCallback);

async function verifyClientSecret(
  client: ExternalApiClient,
  clientSecret: string,
): Promise<boolean> {
  const derived = (await scrypt(
    clientSecret,
    client.secretSalt,
    client.secretHash.length,
  )) as Buffer;
  return derived.length === client.secretHash.length && timingSafeEqual(derived, client.secretHash);
}

function clientSupportsClientCredentialsGrant(client: ExternalApiClient): boolean {
  return client.grants.includes(CLIENT_CREDENTIALS_GRANT);
}

export async function validateClientCredentials(
  clientId: string,
  clientSecret: string,
): Promise<{ config: ExternalApiAuthConfig; client: ExternalApiClient } | null> {
  const config = await getExternalApiAuthConfig();
  const client = getActiveClient(config, clientId);
  if (!client || !clientSupportsClientCredentialsGrant(client)) {
    return null;
  }

  const isValidSecret = await verifyClientSecret(client, clientSecret);
  if (!isValidSecret) {
    return null;
  }

  return { config, client };
}

export async function issueClientCredentialsAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; client: ExternalApiClient } | null> {
  const authResult = await validateClientCredentials(clientId, clientSecret);
  if (!authResult) {
    return null;
  }

  return {
    accessToken: createExternalAccessToken(authResult.config, authResult.client),
    client: authResult.client,
  };
}

export async function authorizeExternalAccessToken(
  token: string,
): Promise<{ claims: ExternalAccessTokenClaims; client: ExternalApiClient } | null> {
  const config = await getExternalApiAuthConfig();
  const claims = verifyExternalAccessToken(token, config);
  if (!claims) {
    return null;
  }

  const client = getActiveClient(config, claims.client_id);
  if (!client || !clientSupportsClientCredentialsGrant(client)) {
    return null;
  }

  return { claims, client };
}
