export type ExternalClientStatus = "ACTIVE" | "INACTIVE";

export type ExternalAllowedLocation = {
  bucket: string;
  prefix: string;
};

export type ExternalApiClient = {
  clientId: string;
  status: ExternalClientStatus;
  grants: string[];
  secretSalt: Buffer;
  secretHash: Buffer;
  allowedLocations: ExternalAllowedLocation[];
};

export type ExternalApiAuthConfig = {
  issuer: string;
  jwtSigningKey: Buffer;
  clients: ExternalApiClient[];
};

export type ExternalAccessTokenClaims = {
  iss: string;
  sub: string;
  client_id: string;
  grant_type: string;
  grants: string[];
  token_use: "access";
  iat: number;
  exp: number;
};
