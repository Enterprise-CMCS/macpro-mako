import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Page } from "@playwright/test";

import { USER_POOL_CLIENT_ID } from "../../mocks/consts";
import { TEST_REVIEWER_USERNAME } from "../../mocks/data/users/cmsReviewer";
import { TEST_STATE_SUBMITTER_USERNAME } from "../../mocks/data/users/stateSubmitters";
import { getDeploymentConfig, getDeploymentOutput, getSecret } from "./auth.secrets";
import {
  findMockUser,
  generateAccessToken,
  generateIdToken,
  generateRefreshToken,
} from "./cognito-tokens";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AUTH_DIR = path.join(__dirname, "../.auth");

export type AuthRole = "state-submitter" | "cms-reviewer";
export type AuthTier = "mocked" | "deployed";

export const AUTH_ROLES: Record<AuthRole, { username: string; label: AuthRole }> = {
  "state-submitter": {
    username: TEST_STATE_SUBMITTER_USERNAME,
    label: "state-submitter",
  },
  "cms-reviewer": {
    username: TEST_REVIEWER_USERNAME,
    label: "cms-reviewer",
  },
};

export function authStatePath(tier: AuthTier, role: AuthRole): string {
  return path.join(AUTH_DIR, tier, `${role}.json`);
}

export async function buildMockedCognitoLocalStorage(
  username: string,
): Promise<Record<string, string>> {
  const user = findMockUser(username);
  if (!user) {
    throw new Error(`No mock Cognito user found for username ${username}`);
  }

  const authTime = Date.now() / 1000;
  const expTime = authTime + 1800;
  const accessToken = (await generateAccessToken(user, authTime, expTime)) || "";
  const idToken = (await generateIdToken(user, authTime, expTime)) || "";
  const refreshToken = (await generateRefreshToken(user)) || "";

  return {
    [`CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.LastAuthUser`]: username,
    [`CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.accessToken`]: accessToken,
    [`CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.clockDrift`]: "0",
    [`CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.idToken`]: idToken,
    [`CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.refreshToken`]: refreshToken,
    [`CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.userData`]: JSON.stringify({
      UserAttributes: user.UserAttributes,
      Username: username,
    }),
    "amplify-redirected-from-hosted-ui": "true",
    "amplify-signin-with-hostedUI": "true",
  };
}

export async function writeMockedStorageState(
  role: AuthRole,
  origin = "http://localhost:5000",
): Promise<string> {
  const username = AUTH_ROLES[role].username;
  const localStorage = await buildMockedCognitoLocalStorage(username);
  const filePath = authStatePath("mocked", role);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(
    filePath,
    JSON.stringify(
      {
        cookies: [],
        origins: [
          {
            origin,
            localStorage: Object.entries(localStorage).map(([name, value]) => ({ name, value })),
          },
        ],
      },
      null,
      2,
    ),
  );

  return filePath;
}

/** Set MOCK_USER_USERNAME so MSW Node handlers resolve the authenticated user. */
export function setMockUserEnv(role: AuthRole = "state-submitter"): void {
  process.env.MOCK_USER_USERNAME = AUTH_ROLES[role].username;
}

export async function loginDeployedStateSubmitter(page: Page, stage: string): Promise<void> {
  const project = process.env.PROJECT || "mako";
  const [deploymentConfig, deploymentOutput] = await Promise.all([
    getDeploymentConfig(stage, project),
    getDeploymentOutput(stage, project),
  ]);
  const passwordSecretArn = deploymentConfig.devPasswordArn;
  if (!passwordSecretArn) {
    throw new Error("deployment-config is missing devPasswordArn");
  }

  const password = await getSecret(passwordSecretArn);
  const email =
    process.env.E2E_STATE_SUBMITTER_EMAIL ||
    deploymentOutput.e2eStateSubmitterEmail ||
    "mako.stateuser@gmail.com";

  await page.goto("/");
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.getByLabel(/email|username/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|submit|continue/i }).click();
  await page.getByRole("heading", { name: "Dashboard", level: 1 }).waitFor({ timeout: 120_000 });
}

export async function writeDeployedStorageState(page: Page, role: AuthRole): Promise<string> {
  const filePath = authStatePath("deployed", role);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await page.context().storageState({ path: filePath });
  return filePath;
}
