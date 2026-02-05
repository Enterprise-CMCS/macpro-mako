import type {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  APIGatewayTokenAuthorizerHandler,
} from "aws-lambda";
import { createRemoteJWKSet, jwtVerify, JWTVerifyGetKey } from "jose";

const issuer = process.env.IDM_ISSUER;
const audience = process.env.IDM_AUDIENCE;
const jwksUri = process.env.IDM_JWKS_URI;
const requiredScope = process.env.IDM_REQUIRED_SCOPE;
const requireAct = process.env.IDM_REQUIRE_ACT === "true";

if (!issuer) {
  throw new Error("IDM_ISSUER is required");
}
if (!audience) {
  throw new Error("IDM_AUDIENCE is required");
}

let jwks: JWTVerifyGetKey | null = null;
let jwksUrlPromise: Promise<URL> | null = null;

async function resolveJwksUrl(): Promise<URL> {
  if (jwksUri) {
    return new URL(jwksUri);
  }

  if (!jwksUrlPromise) {
    const discoveryUrl = new URL(`${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`);
    jwksUrlPromise = fetch(discoveryUrl.toString())
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load OIDC discovery document: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data.jwks_uri) {
          throw new Error("OIDC discovery document missing jwks_uri");
        }
        return new URL(data.jwks_uri);
      });
  }

  return jwksUrlPromise;
}

async function getJwks(): Promise<JWTVerifyGetKey> {
  if (!jwks) {
    const url = await resolveJwksUrl();
    jwks = createRemoteJWKSet(url);
  }
  return jwks;
}

function getToken(authorizationToken?: string): string | null {
  if (!authorizationToken) {
    return null;
  }
  const [scheme, token] = authorizationToken.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") {
    return null;
  }
  return token.trim();
}

function buildPolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string,
  context?: Record<string, string>,
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };
}

function normalizeScope(scopeClaim: unknown): string[] {
  if (Array.isArray(scopeClaim)) {
    return scopeClaim.filter((scope) => typeof scope === "string") as string[];
  }
  if (typeof scopeClaim === "string") {
    return scopeClaim.split(" ").filter(Boolean);
  }
  return [];
}

export const handler: APIGatewayTokenAuthorizerHandler = async (
  event: APIGatewayTokenAuthorizerEvent,
) => {
  const token = getToken(event.authorizationToken);
  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const jwksKey = await getJwks();
    const { payload } = await jwtVerify(token, jwksKey, {
      issuer,
      audience,
    });

    const scopes = normalizeScope(payload.scope ?? payload.scp);
    if (requiredScope && !scopes.includes(requiredScope)) {
      return buildPolicy(payload.sub ?? "idm-user", "Deny", event.methodArn, {
        scope: scopes.join(" "),
      });
    }

    if (requireAct) {
      const act = payload.act as { sub?: string } | undefined;
      if (!act || typeof act !== "object" || typeof act.sub !== "string") {
        return buildPolicy(payload.sub ?? "idm-user", "Deny", event.methodArn, {
          reason: "act-claim-required",
        });
      }
    }

    return buildPolicy(payload.sub ?? "idm-user", "Allow", event.methodArn, {
      scope: scopes.join(" "),
      issuer: typeof payload.iss === "string" ? payload.iss : "",
    });
  } catch (error) {
    console.error("IDM JWT validation failed:", error);
    throw new Error("Unauthorized");
  }
};
