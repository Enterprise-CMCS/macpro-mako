import type { StorybookConfig } from "@storybook/react-vite";
import {
  API_ENDPOINT,
  IDENTITY_POOL_ID,
  IDM_HOME_URL,
  LAUNCHDARKLY_CLIENT_ID,
  REGION,
  USER_POOL_CLIENT_DOMAIN,
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
} from "mocks";

const config: StorybookConfig = {
  env: (config) => ({
    ...config,
    VITE_API_REGION: REGION,
    VITE_API_URL: API_ENDPOINT,
    VITE_NODE_ENV: "development",
    VITE_COGNITO_REGION: REGION,
    VITE_COGNITO_IDENTITY_POOL_ID: IDENTITY_POOL_ID,
    VITE_COGNITO_USER_POOL_ID: USER_POOL_ID,
    VITE_COGNITO_USER_POOL_CLIENT_ID: USER_POOL_CLIENT_ID,
    VITE_COGNITO_USER_POOL_CLIENT_DOMAIN: USER_POOL_CLIENT_DOMAIN,
    VITE_COGNITO_REDIRECT_SIGNIN: "http://localhost:5000/dashboard",
    VITE_COGNITO_REDIRECT_SIGNOUT: "http://localhost:5000/",
    VITE_IDM_HOME_URL: IDM_HOME_URL,
    VITE_GOOGLE_ANALYTICS_GTAG: "",
    VITE_GOOGLE_ANALYTICS_DISABLE: "true",
    VITE_LAUNCHDARKLY_CLIENT_ID: LAUNCHDARKLY_CLIENT_ID,
  }),
  stories: ["../src/**/*.mdx", "../src/**/*.stories.{js,jsx,mjs,ts,tsx}"],
  typescript: { check: true },
  staticDirs: ["../public", "../dist"],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
    "storybook-addon-remix-react-router",
  ],
  framework: "@storybook/react-vite",
  core: {
    builder: "@storybook/builder-vite",
  },
  features: {
    developmentModeForBuild: true,
  },
};
export default config;
