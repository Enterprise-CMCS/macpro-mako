import path from "path";
import { promises as fs } from "fs";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { project, region } from "./consts";

export async function writeUiEnvFile(stage, local = false) {
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
      ? `"http://localhost:5173/"`
      : deploymentOutput.applicationEndpointUrl,
    VITE_COGNITO_REDIRECT_SIGNOUT: local
      ? `"http://localhost:5173/"`
      : deploymentOutput.applicationEndpointUrl,
    VITE_IDM_HOME_URL: deploymentOutput.idmHomeUrl,
    VITE_GOOGLE_ANALYTICS_GTAG: `"${deploymentConfig.googleAnalyticsGTag}"`,
    VITE_GOOGLE_ANALYTICS_DISABLE: `"${deploymentConfig.googleAnalyticsDisable}"`,
    VITE_LAUNCHDARKLY_CLIENT_ID: `"${deploymentConfig.launchDarklyClientId}"`,
  };

  const envFilePath = path.join(__dirname, "../../../react-app", ".env.local");
  console.log(envFilePath);
  const envFileContent = Object.entries(envVariables)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(envFilePath, envFileContent);

  console.log(`.env.local file written to ${envFilePath}`);
  return envFilePath;
}
