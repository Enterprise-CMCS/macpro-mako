import { getSecret, validateEnvVariable } from "shared-utils";

import { SECRET_CACHE_TTL_MS } from "./constants";
import {
  ExternalAllowedLocation,
  ExternalApiAuthConfig,
  ExternalApiClient,
  ExternalClientStatus,
} from "./types";

type CachedConfig = {
  secretArn: string;
  loadedAtMs: number;
  config: ExternalApiAuthConfig;
};

let cachedConfig: CachedConfig | null = null;

function ensureNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid external auth config: ${fieldName} must be a non-empty string.`);
  }
  return value.trim();
}

function parseHex(value: unknown, fieldName: string): Buffer {
  const parsedValue = ensureNonEmptyString(value, fieldName);
  if (!/^[0-9a-f]+$/i.test(parsedValue) || parsedValue.length % 2 !== 0) {
    throw new Error(`Invalid external auth config: ${fieldName} must be a valid hex string.`);
  }

  const asBuffer = Buffer.from(parsedValue, "hex");
  if (asBuffer.length === 0) {
    throw new Error(`Invalid external auth config: ${fieldName} cannot be empty.`);
  }
  return asBuffer;
}

function parseBase64(value: unknown, fieldName: string): Buffer {
  const parsedValue = ensureNonEmptyString(value, fieldName);
  const normalized = parsedValue.replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/=]+$/.test(normalized)) {
    throw new Error(`Invalid external auth config: ${fieldName} must be base64 encoded.`);
  }

  const asBuffer = Buffer.from(normalized, "base64");
  if (asBuffer.length === 0) {
    throw new Error(`Invalid external auth config: ${fieldName} cannot decode to an empty value.`);
  }
  return asBuffer;
}

function parseAllowedLocations(rawAllowedLocations: unknown): ExternalAllowedLocation[] {
  if (!Array.isArray(rawAllowedLocations)) {
    throw new Error("Invalid external auth config: client.allowedLocations must be an array.");
  }

  return rawAllowedLocations.map((location, index) => {
    if (!location || typeof location !== "object") {
      throw new Error(
        `Invalid external auth config: client.allowedLocations[${index}] must be an object.`,
      );
    }

    const typedLocation = location as Record<string, unknown>;
    return {
      bucket: ensureNonEmptyString(
        typedLocation.bucket,
        `client.allowedLocations[${index}].bucket`,
      ),
      prefix:
        typeof typedLocation.prefix === "string" && typedLocation.prefix.trim().length > 0
          ? typedLocation.prefix
          : "",
    };
  });
}

function parseStatus(value: unknown): ExternalClientStatus {
  if (value === "ACTIVE" || value === "INACTIVE") {
    return value;
  }
  throw new Error("Invalid external auth config: client.status must be ACTIVE or INACTIVE.");
}

function parseClient(client: unknown, index: number): ExternalApiClient {
  if (!client || typeof client !== "object") {
    throw new Error(`Invalid external auth config: clients[${index}] must be an object.`);
  }

  const typedClient = client as Record<string, unknown>;
  const grants = typedClient.grants;
  if (!Array.isArray(grants) || grants.some((grant) => typeof grant !== "string")) {
    throw new Error(`Invalid external auth config: clients[${index}].grants must be string[].`);
  }

  return {
    clientId: ensureNonEmptyString(typedClient.clientId, `clients[${index}].clientId`),
    status: parseStatus(typedClient.status),
    grants: grants as string[],
    secretSalt: parseBase64(typedClient.secretSalt, `clients[${index}].secretSalt`),
    secretHash: parseBase64(typedClient.secretHash, `clients[${index}].secretHash`),
    allowedLocations: parseAllowedLocations(typedClient.allowedLocations),
  };
}

function parseConfig(configString: string): ExternalApiAuthConfig {
  let parsedConfig: unknown;
  try {
    parsedConfig = JSON.parse(configString);
  } catch {
    throw new Error("Invalid external auth config: secret value must be valid JSON.");
  }

  if (!parsedConfig || typeof parsedConfig !== "object") {
    throw new Error("Invalid external auth config: root value must be an object.");
  }

  const typedConfig = parsedConfig as Record<string, unknown>;
  const clients = typedConfig.clients;
  if (!Array.isArray(clients)) {
    throw new Error("Invalid external auth config: clients must be an array.");
  }

  return {
    issuer: ensureNonEmptyString(typedConfig.issuer, "issuer"),
    jwtSigningKey: parseHex(typedConfig.jwtSigningSecretHex, "jwtSigningSecretHex"),
    clients: clients.map((client, index) => parseClient(client, index)),
  };
}

export async function getExternalApiAuthConfig(): Promise<ExternalApiAuthConfig> {
  const secretArn = validateEnvVariable("externalApiAuthSecretArn");

  if (
    cachedConfig &&
    cachedConfig.secretArn === secretArn &&
    Date.now() - cachedConfig.loadedAtMs < SECRET_CACHE_TTL_MS
  ) {
    return cachedConfig.config;
  }

  const secretValue = await getSecret(secretArn);
  const config = parseConfig(secretValue);
  cachedConfig = {
    secretArn,
    loadedAtMs: Date.now(),
    config,
  };

  return config;
}

export function getActiveClient(
  config: ExternalApiAuthConfig,
  clientId: string,
): ExternalApiClient | undefined {
  return config.clients.find(
    (client) => client.clientId === clientId && client.status === "ACTIVE",
  );
}

export function resetExternalApiAuthConfigCache() {
  cachedConfig = null;
}
