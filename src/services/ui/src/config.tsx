const config = {
  apiGateway: {
    REGION: import.meta.env.VITE_API_REGION,
    URL: import.meta.env.VITE_API_URL,
  },
  cognito: {
    REGION: import.meta.env.VITE_COGNITO_REGION,
    USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    APP_CLIENT_ID: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
    APP_CLIENT_DOMAIN: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_DOMAIN,
    IDENTITY_POOL_ID: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
    REDIRECT_SIGNIN: import.meta.env.VITE_COGNITO_REDIRECT_SIGNIN,
    REDIRECT_SIGNOUT: import.meta.env.VITE_COGNITO_REDIRECT_SIGNOUT,
    BOOTSTRAP_USERS_PW: import.meta.env.BOOTSTRAP_USERS_PW,
  },
};

export default config;
