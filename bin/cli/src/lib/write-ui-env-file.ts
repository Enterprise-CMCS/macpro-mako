import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { promises as fs } from "fs";
import path from "path";

import { mockEnvVariables, project, region } from "./consts";

async function writeEnvVarsToFile(envVariables, filename) {
  const envFilePath = path.join(__dirname, "../../../react-app", filename);
  console.log(envFilePath);
  const envFileContent = Object.entries(envVariables)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(envFilePath, envFileContent);

  console.log(`${filename} file written to ${envFilePath}`);
  return envFilePath;
}

export async function writeUiEnvFile(stage, local = false) {
  console.log("write-ui-env-file __dirname:", __dirname);

  const ssm = new SSMClient({ region: "us-east-1" });

  const deploymentOutput = JSON.parse(
    (
      await ssm.send(
        new GetParameterCommand({
          Name: `/${project}/${stage}/deployment-output`,
        }),
      )
    ).Parameter!.Value!,
  );

  const deploymentConfig = JSON.parse(
    (
      await ssm.send(
        new GetParameterCommand({
          Name: `/${project}/${stage}/deployment-config`,
        }),
      )
    ).Parameter!.Value!,
  );

  let googleAnalytics = "";
  try {
    if (["main", "val", "production"].includes(stage)) {
      googleAnalytics = (
        await ssm.send(
          new GetParameterCommand({
            Name: `/${project}/${stage}/google-analytics-id`,
          }),
        )
      ).Parameter!.Value!;
    }
  } catch {
    console.error("Can't find the Google Analytics ID");
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
    VITE_SMART_LINK_URL: deploymentOutput.smartLinkUrl,
    VITE_MACPRO_LINK_URL: deploymentOutput.macproLinkUrl,
    VITE_GOOGLE_ANALYTICS_GTAG: `"${googleAnalytics}"`,
    VITE_GOOGLE_ANALYTICS_DISABLE: `"${deploymentConfig.googleAnalyticsDisable}"`,
    VITE_LAUNCHDARKLY_CLIENT_ID: `"${deploymentConfig.launchDarklyClientId}"`,
  };

  const envFilePath = writeEnvVarsToFile(envVariables, ".env.local");

  if (["main", "val", "production"].includes(stage)) {
    // Separate env file creation specific to google analytics
    // write file so that it is directly accessible from the vite /dist directory
    const publicDirPath = path.resolve(__dirname, "../../../react-app/src/assets");
    await fs.mkdir(publicDirPath, { recursive: true });
    console.log("Created google analytics directory (or already existed)");
    const jsonPath = path.join(publicDirPath, "env.json");
    console.log("Will write GA env.json to:", jsonPath);
    await fs.writeFile(
      jsonPath,
      JSON.stringify({ VITE_GOOGLE_ANALYTICS_GTAG: googleAnalytics }, null, 2),
    );
    console.log("✅ Successfully wrote env.json and gtag = ", googleAnalytics);
  }

  return envFilePath;
}

export async function writeMockedUiEnvFile(username) {
  const envVariables = {
    ...mockEnvVariables,
    VITE_MOCK_USER_USERNAME: `"${username}"`,
  };

  return writeEnvVarsToFile(envVariables, ".env.mocked.local");
}
