import { Page } from "@playwright/test";

import { LoginPage } from "@/pages";

import { getDeploymentConfig, getSecret } from "./auth.secrets";

let loginPage;

export type LoginFn = (page: Page, username: string, password?: string) => Promise<void>;

export const cognitoLogin: LoginFn = async (page, username) => {
  const stage = process.env.STAGE_NAME || "main";
  const project = process.env.PROJECT;
  const deploymentConfig = await getDeploymentConfig(stage, project);
  const password = await getSecret(deploymentConfig.devPasswordArn);
  loginPage = new LoginPage(page);

  await loginPage.login(username, password);
};

export const euaLogin: LoginFn = async (page, username, password) => {
  loginPage = new LoginPage(page);
  await loginPage.euaLogin(username, password);
};

export const mfaLogin: LoginFn = async (page, username, password) => {
  loginPage = new LoginPage(page);
  await loginPage.mfaLogin(username, password);
};

export const authStrategyMap: Record<string, Record<string, LoginFn>> = {
  local: {
    stateSubmitter: cognitoLogin,
    submitter: cognitoLogin,
    stateSystemAdmin: cognitoLogin,
    cmsReviewer: cognitoLogin,
    cmsRoleApprover: cognitoLogin,
    systemAdmin: cognitoLogin,
    helpDesk: cognitoLogin,
    
  },
  dev: {
    stateSubmitter: cognitoLogin,
    cmsReviewer: cognitoLogin,
  },
  val: {
    stateSubmitter: cognitoLogin,
    cmsReviewer: cognitoLogin,
  },
  ci: {
    stateSubmitter: cognitoLogin,
    cmsReviewer: cognitoLogin,
  },
  prod: {
    stateSubmitter: mfaLogin,
    cmsReviewer: euaLogin,
  },
};
