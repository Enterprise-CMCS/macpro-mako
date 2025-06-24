import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { promises as fs } from "fs";
import path from "path";

import { mockEnvs, project, region } from "./consts.js";

export async function writeUiEnvFile(stage: string, local: boolean = false) {
  const deploymentOutput = JSON.parse(
    (
      await new SSMClient({ region: "us-east-1" }).send(
        new GetParameterCommand({
          Name: `/${project}/${stage}/deployment-output`,
        }),
      )
    ).Parameter!.Value!,
  );

  const deploymentConfig = JSON.parse(
    (
      await new SSMClient({ region: "us-east-1" }).send(
        new GetParameterCommand({
          Name: `/${project}/${stage}/deployment-config`,
        }),
      )
    ).Parameter!.Value!,
  );

  let googleAnalytics;
  try {
    if (["main", "val", "production"].includes(stage)) {
      {
        googleAnalytics = (
          await new SSMClient({ region: "us-east-1" }).send(
            new GetParameterCommand({
              Name: `/${project}/${stage}/google-analytics-id`,
            }),
          )
        ).Parameter!.Value!;
      }
    }
  } catch {
    googleAnalytics = "";
    console.error("Can't find the google analytics ID");
  }
  const envVariables = {
    VITE_API_REGION: `"${region}"`,
    VITE_API_URL: deploymentOutput.apiGatewayRestApiUrl,
    VITE_NODE_ENV: `"development"`,
    VITE_COGNITO_REGION: region,
    VITE_COGNITO_IDENTITY_POOL_ID: deploymentOutput.identityPoolId,
    VITE_COGNITO_USER_POOL_ID: deploymentOutput.userPoolId,
    VITE_COGNITO_USER_POOL_CLIENT_ID: deploymentOutput.userPoolClientId,
    VITE_COGNITO_USER_POOL_CLIENT_DOMAIN: deploymentOutput.userPoolClientDomain,
    VITE_COGNITO_REDIRECT_SIGNIN: local
      ? `"http://localhost:5000/dashboard"`
      : `${deploymentOutput.applicationEndpointUrl}dashboard`,
    VITE_COGNITO_REDIRECT_SIGNOUT: local
      ? `"http://localhost:5000/"`
      : deploymentOutput.applicationEndpointUrl,
    VITE_IDM_HOME_URL: deploymentOutput.idmHomeUrl,
    VITE_GOOGLE_ANALYTICS_GTAG: `"${googleAnalytics}"`,
    VITE_GOOGLE_ANALYTICS_DISABLE: `"${deploymentConfig.googleAnalyticsDisable}"`,
    VITE_LAUNCHDARKLY_CLIENT_ID: `"${deploymentConfig.launchDarklyClientId}"`,
  };

  return writeFile(envVariables, ".env.local");
}

export async function writeUiEnvMockedApiFile(username: string) {
  const envVariables = {
    VITE_API_REGION: `"${mockEnvs.REGION}"`,
    VITE_API_URL: `"${mockEnvs.API_ENDPOINT}"`,
    VITE_NODE_ENV: `"development"`,
    VITE_COGNITO_REGION: `"${mockEnvs.REGION}"`,
    VITE_COGNITO_IDENTITY_POOL_ID: `"${mockEnvs.IDENTITY_POOL_ID}"`,
    VITE_COGNITO_USER_POOL_ID: `"${mockEnvs.USER_POOL_ID}"`,
    VITE_COGNITO_USER_POOL_CLIENT_ID: `"${mockEnvs.USER_POOL_CLIENT_ID}"`,
    VITE_COGNITO_USER_POOL_CLIENT_DOMAIN: `"${mockEnvs.USER_POOL_CLIENT_DOMAIN}"`,
    VITE_COGNITO_REDIRECT_SIGNIN: `"http://localhost:5000/dashboard"`,
    VITE_COGNITO_REDIRECT_SIGNOUT: `"http://localhost:5000/"`,
    VITE_IDM_HOME_URL: `"${mockEnvs.IDM_HOME_URL}"`,
    VITE_GOOGLE_ANALYTICS_GTAG: `""`,
    VITE_GOOGLE_ANALYTICS_DISABLE: `"true"`,
    VITE_LAUNCHDARKLY_CLIENT_ID: `"${mockEnvs.LAUNCHDARKLY_CLIENT_ID}"`,
    VITE_MOCK_USER_USERNAME: `"${username}"`,
  };

  return writeFile(envVariables, ".env.mocked.local");
}

async function writeFile(envVariables: { [key: string]: string }, filename: string) {
  const envFilePath = path.join(__dirname, "../../../react-app", filename);
  console.log(envFilePath);
  const envFileContent = Object.entries(envVariables)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(envFilePath, envFileContent);

  console.log(`${filename} file written to ${envFilePath}`);
  return envFilePath;
}
