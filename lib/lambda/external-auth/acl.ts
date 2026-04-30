import { ExternalApiClient } from "./types";

export function isClientAllowedForObject(
  client: ExternalApiClient,
  bucket: string,
  key: string,
): boolean {
  return client.allowedLocations.some((location) => {
    return location.bucket === bucket && key.startsWith(location.prefix);
  });
}
