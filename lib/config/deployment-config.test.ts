import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DeploymentConfig,
  InjectedConfigOptions,
  DeploymentConfigProperties,
} from "../config/deployment-config";
import * as sharedUtils from "shared-utils";

// Mock the shared-utils module
vi.mock("shared-utils", () => ({
  getExport: vi.fn(),
  getSecret: vi.fn(),
}));

describe("DeploymentConfig", () => {
  const project = "test-project";
  const defaultSecret = JSON.stringify({
    brokerString: "brokerString",
    dbInfoSecretName: "dbInfoSecretName", // pragma: allowlist secret
    devPasswordArn: "devPasswordArn", // pragma: allowlist secret
    domainCertificateArn: "domainCertificateArn",
    domainName: "domainName",
    emailAddressLookupSecretName: "emailAddressLookupSecretName", // pragma: allowlist secret
    googleAnalyticsDisable: "true",
    googleAnalyticsGTag: "googleAnalyticsGTag",
    idmAuthzApiEndpoint: "idmAuthzApiEndpoint",
    idmAuthzApiKeyArn: "idmAuthzApiKeyArn", // pragma: allowlist secret
    idmClientId: "idmClientId",
    idmClientIssuer: "idmClientIssuer",
    idmClientSecretArn: "idmClientSecretArn", // pragma: allowlist secret
    idmEnable: "true",
    idmHomeUrl: "idmHomeUrl",
    legacyS3AccessRoleArn: "legacyS3AccessRoleArn",
    useSharedOpenSearch: "true",
    vpcName: "vpcName",
    emailFromIdentity: "test@cms.hhs.gov",
    emailIdentityDomain: "cms.hhs.gov",
    iamPath: "/my/path/",
    iamPermissionsBoundary: "arn:aws:iam::1234578910:policy/foo/bar-policy",
  });

  const stageSecret = JSON.stringify({
    domainName: "stage-domainName",
    googleAnalyticsDisable: "false",
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(sharedUtils, "getSecret").mockImplementation((secretName) => {
      if (secretName === `${project}-default`) {
        return Promise.resolve(defaultSecret);
      }
      if (secretName === `${project}-dev`) {
        return Promise.resolve(stageSecret);
      }
      if (secretName === `${project}-val`) {
        return Promise.resolve("{}"); // Empty secret for validation stage
      }
      if (secretName === `${project}-production`) {
        return Promise.resolve("{}"); // Empty secret for production stage
      }
      return Promise.reject(new Error(`Secret not found: ${secretName}`));
    });
    vi.spyOn(sharedUtils, "getExport").mockImplementation((exportName) => {
      if (exportName === `${project}-sharedOpenSearchDomainArn`) {
        return Promise.resolve("sharedOpenSearchDomainArn");
      }
      if (exportName === `${project}-sharedOpenSearchDomainEndpoint`) {
        return Promise.resolve("sharedOpenSearchDomainEndpoint");
      }
      return Promise.reject(new Error(`Export not found: ${exportName}`));
    });
  });

  it("should fetch and merge configuration", async () => {
    const options: InjectedConfigOptions = { project, stage: "dev" };
    const deploymentConfig = await DeploymentConfig.fetch(options);

    const expectedConfig: DeploymentConfigProperties = {
      brokerString: "brokerString",
      dbInfoSecretName: "dbInfoSecretName", // pragma: allowlist secret
      devPasswordArn: "devPasswordArn", // pragma: allowlist secret
      domainCertificateArn: "domainCertificateArn",
      domainName: "stage-domainName", // Overridden by stage secret
      emailAddressLookupSecretName: "emailAddressLookupSecretName", // pragma: allowlist secret
      googleAnalyticsDisable: false, // Converted to boolean and overridden by stage secret
      googleAnalyticsGTag: "googleAnalyticsGTag",
      idmAuthzApiEndpoint: "idmAuthzApiEndpoint",
      idmAuthzApiKeyArn: "idmAuthzApiKeyArn", // pragma: allowlist secret
      idmClientId: "idmClientId",
      idmClientIssuer: "idmClientIssuer",
      idmClientSecretArn: "idmClientSecretArn", // pragma: allowlist secret
      idmEnable: true, // Converted to boolean
      idmHomeUrl: "idmHomeUrl",
      legacyS3AccessRoleArn: "legacyS3AccessRoleArn",
      useSharedOpenSearch: true, // Converted to boolean
      vpcName: "vpcName",
      isDev: true,
      project: "test-project",
      sharedOpenSearchDomainArn: "sharedOpenSearchDomainArn",
      sharedOpenSearchDomainEndpoint: "sharedOpenSearchDomainEndpoint",
      stage: "dev",
      terminationProtection: false,
      emailFromIdentity: "test@cms.hhs.gov",
      emailIdentityDomain: "cms.hhs.gov",
      iamPath: "/my/path/",
      iamPermissionsBoundary: "arn:aws:iam::1234578910:policy/foo/bar-policy",
    };

    expect(deploymentConfig.config).toEqual(expectedConfig);
  });

  it("should throw an error if default secret is not found", async () => {
    vi.spyOn(sharedUtils, "getSecret").mockImplementation((secretName) => {
      if (secretName === `${project}-default`) {
        return Promise.reject(new Error(`Secret not found: ${secretName}`));
      }
      return Promise.resolve(stageSecret);
    });

    await expect(
      DeploymentConfig.fetch({ project, stage: "dev" }),
    ).rejects.toThrow(`Failed to fetch mandatory secret ${project}-default`);
  });

  it("should warn if stage secret is not found", async () => {
    vi.spyOn(sharedUtils, "getSecret").mockImplementation((secretName) => {
      if (secretName === `${project}-default`) {
        return Promise.resolve(defaultSecret);
      }
      return Promise.reject(new Error(`Secret not found: ${secretName}`));
    });

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const deploymentConfig = await DeploymentConfig.fetch({
      project,
      stage: "dev",
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `Optional stage secret ${project}-dev not found: Secret not found: ${project}-dev`,
    );

    const expectedConfig: DeploymentConfigProperties = {
      brokerString: "brokerString",
      dbInfoSecretName: "dbInfoSecretName", // pragma: allowlist secret
      devPasswordArn: "devPasswordArn", // pragma: allowlist secret
      domainCertificateArn: "domainCertificateArn",
      domainName: "domainName",
      emailAddressLookupSecretName: "emailAddressLookupSecretName", // pragma: allowlist secret
      googleAnalyticsDisable: true,
      googleAnalyticsGTag: "googleAnalyticsGTag",
      idmAuthzApiEndpoint: "idmAuthzApiEndpoint",
      idmAuthzApiKeyArn: "idmAuthzApiKeyArn", // pragma: allowlist secret
      idmClientId: "idmClientId",
      idmClientIssuer: "idmClientIssuer",
      idmClientSecretArn: "idmClientSecretArn", // pragma: allowlist secret
      idmEnable: true,
      idmHomeUrl: "idmHomeUrl",
      legacyS3AccessRoleArn: "legacyS3AccessRoleArn",
      useSharedOpenSearch: true,
      vpcName: "vpcName",
      isDev: true,
      project: "test-project",
      sharedOpenSearchDomainArn: "sharedOpenSearchDomainArn",
      sharedOpenSearchDomainEndpoint: "sharedOpenSearchDomainEndpoint",
      stage: "dev",
      terminationProtection: false,
      emailFromIdentity: "test@cms.hhs.gov",
      emailIdentityDomain: "cms.hhs.gov",
      iamPath: "/my/path/",
      iamPermissionsBoundary: "arn:aws:iam::1234578910:policy/foo/bar-policy",
    };

    expect(deploymentConfig.config).toEqual(expectedConfig);
  });

  it("should set isDev to false and terminationProtection to true for val and production stages", async () => {
    const stages = ["val", "production"];

    for (const stage of stages) {
      const options: InjectedConfigOptions = { project, stage };
      const deploymentConfig = await DeploymentConfig.fetch(options);

      expect(deploymentConfig.config.isDev).toBe(false);
      expect(deploymentConfig.config.terminationProtection).toBe(true);
    }
  });
});
