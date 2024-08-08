/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_REGION: string;
  readonly VITE_API_URL: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_COGNITO_REGION: string;
  readonly VITE_COGNITO_IDENTITY_POOL_ID: string;
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_USER_POOL_CLIENT_ID: string;
  readonly VITE_COGNITO_USER_POOL_CLIENT_DOMAIN: string;
  readonly VITE_COGNITO_REDIRECT_SIGNIN: string;
  readonly VITE_COGNITO_REDIRECT_SIGNOUT: string;
  readonly VITE_IDM_HOME_URL: string;
  readonly VITE_GOOGLE_ANALYTICS_GTAG: string;
  readonly VITE_GOOGLE_ANALYTICS_DISABLE: string;
  readonly VITE_LAUNCHDARKLY_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
