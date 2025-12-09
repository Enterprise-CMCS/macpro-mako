import "./localStoragePolyfill";

import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";
import {
  API_ENDPOINT,
  IDENTITY_POOL_ID,
  IDM_HOME_URL,
  LAUNCHDARKLY_CLIENT_ID,
  REGION,
  // SMART_LINK_URL,
  USER_POOL_CLIENT_DOMAIN,
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
} from "mocks";

// @ts-ignore module is esnext
const require = createRequire(import.meta.url);

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
    // VITE_SMART_LINK_URL: SMART_LINK_URL,
    VITE_GOOGLE_ANALYTICS_GTAG: "",
    VITE_GOOGLE_ANALYTICS_DISABLE: "true",
    VITE_LAUNCHDARKLY_CLIENT_ID: LAUNCHDARKLY_CLIENT_ID,
  }),
  stories: ["../src/**/*.mdx", "../src/**/*.stories.{js,jsx,mjs,ts,tsx}"],
  typescript: { check: true },
  staticDirs: ["../public", "../dist"],
  addons: [
    getAbsolutePath("@whitespace/storybook-addon-html"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("storybook-addon-remix-react-router"),
  ],
  framework: getAbsolutePath("@storybook/react-vite"),
  core: {
    builder: getAbsolutePath("@storybook/builder-vite"),
  },
  features: {
    developmentModeForBuild: true,
  },
};
export default config;

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
