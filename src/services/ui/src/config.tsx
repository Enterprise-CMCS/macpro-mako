const config = {
  apiGateway: {
    REGION: process.env.VITE_API_REGION,
    URL: process.env.VITE_API_URL,
  },
  cognito: {
    REGION: process.env.VITE_COGNITO_REGION,
    USER_POOL_ID: process.env.VITE_COGNITO_USER_POOL_ID,
    APP_CLIENT_ID: process.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
    APP_CLIENT_DOMAIN: process.env.VITE_COGNITO_USER_POOL_CLIENT_DOMAIN,
    IDENTITY_POOL_ID: process.env.VITE_COGNITO_IDENTITY_POOL_ID,
    REDIRECT_SIGNIN: process.env.VITE_COGNITO_REDIRECT_SIGNIN,
    REDIRECT_SIGNOUT: process.env.VITE_COGNITO_REDIRECT_SIGNOUT,
  },
};

export default config;
