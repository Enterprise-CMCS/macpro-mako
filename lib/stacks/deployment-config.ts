import { getExport, getSecret } from "shared-utils";

export interface InjectedConfigOptions {
  project: string;
  stage: string;
  region?: string;
}

export type InjectedConfigProperties = {
  brokerString: string;
  dbInfoSecretName: string;
  devPasswordArn: string;
  domainCertificateArn: string;
  domainName: string;
  emailAddressLookupSecretName: string;
  emailFromIdentity: string;
  emailIdentityDomain: string;
  googleAnalyticsDisable: boolean;
  googleAnalyticsGTag: string;
  iamPath: string;
  iamPermissionsBoundary: string;
  idmAuthzApiEndpoint: string;
  idmAuthzApiKeyArn: string;
  idmClientId: string;
  idmClientIssuer: string;
  idmClientSecretArn: string;
  idmEnable: boolean;
  idmHomeUrl: string;
  legacyS3AccessRoleArn: string;
  useSharedOpenSearch: boolean;
  vpcName: string;
};

export type DeploymentConfigProperties = InjectedConfigProperties & {
  isDev: boolean;
  project: string;
  sharedOpenSearchDomainArn: string;
  sharedOpenSearchDomainEndpoint: string;
  stage: string;
  terminationProtection: boolean;
};

export class DeploymentConfig {
  public config: DeploymentConfigProperties;

  private constructor(
    options: InjectedConfigOptions,
    config: DeploymentConfigProperties,
  ) {
    this.config = config;
  }

  public static async fetch(
    options: InjectedConfigOptions,
  ): Promise<DeploymentConfig> {
    const injectedConfig = await DeploymentConfig.loadConfig(options);
    const appConfig: DeploymentConfigProperties = {
      ...injectedConfig,
      project: options.project,
      stage: options.stage,
      isDev: !["main", "val", "production"].includes(options.stage),
      terminationProtection: ["main", "val", "production"].includes(
        options.stage,
      ),
      sharedOpenSearchDomainArn: "",
      sharedOpenSearchDomainEndpoint: "",
    };

    const appConfigInstance = new DeploymentConfig(options, appConfig);
    await appConfigInstance.initialize();
    return appConfigInstance;
  }

  private static async loadConfig(
    options: InjectedConfigOptions,
  ): Promise<InjectedConfigProperties> {
    const { project, stage } = options;
    const defaultSecretName = `${project}-default`;
    const stageSecretName = `${project}-${stage}`;

    // Fetch project-default secret
    let defaultSecret: { [key: string]: string } = {};
    try {
      defaultSecret = JSON.parse(await getSecret(defaultSecretName));
    } catch (error) {
      throw new Error(`Failed to fetch mandatory secret ${defaultSecretName}`);
    }

    // Fetch project-stage secret if it exists and is not marked for deletion
    let stageSecret: { [key: string]: string } = {};
    try {
      stageSecret = JSON.parse(await getSecret(stageSecretName));
    } catch (error) {
      console.warn(
        `Optional stage secret ${stageSecretName} not found: ${error.message}`,
      );
    }

    // Merge secrets with stageSecret taking precedence
    let combinedSecret: { [key: string]: any } = {
      ...defaultSecret,
      ...stageSecret,
    };

    // Convert "true"/"false" strings to booleans
    Object.keys(combinedSecret).forEach((key) => {
      if (combinedSecret[key] === "true") {
        combinedSecret[key] = true;
      } else if (combinedSecret[key] === "false") {
        combinedSecret[key] = false;
      }
    });

    if (!this.isConfig(combinedSecret)) {
      throw new Error(
        `The resolved configuration for stage ${stage} has missing or malformed values.`,
      );
    }

    return combinedSecret as InjectedConfigProperties;
  }

  private static isConfig(config: any): config is InjectedConfigProperties {
    return (
      typeof config.brokerString === "string" &&
      typeof config.dbInfoSecretName == "string" && // pragma: allowlist secret
      typeof config.devPasswordArn == "string" && // pragma: allowlist secret
      typeof config.domainCertificateArn == "string" &&
      typeof config.domainName === "string" &&
      typeof config.emailAddressLookupSecretName === "string" && // pragma: allowlist secret
      typeof config.googleAnalyticsDisable == "boolean" &&
      typeof config.googleAnalyticsGTag === "string" &&
      typeof config.iamPermissionsBoundary === "string" &&
      typeof config.iamPath === "string" &&
      typeof config.idmAuthzApiEndpoint === "string" &&
      typeof config.idmAuthzApiKeyArn === "string" && // pragma: allowlist secret
      typeof config.idmClientId === "string" &&
      typeof config.idmClientIssuer === "string" &&
      typeof config.idmClientSecretArn === "string" && // pragma: allowlist secret
      typeof config.idmEnable === "boolean" &&
      typeof config.idmHomeUrl === "string" &&
      typeof config.legacyS3AccessRoleArn === "string" &&
      typeof config.useSharedOpenSearch === "boolean" &&
      typeof config.vpcName === "string" &&
      typeof config.emailFromIdentity === "string" &&
      typeof config.emailIdentityDomain === "string"
    );
  }

  private async initialize(): Promise<void> {
    if (this.config.useSharedOpenSearch) {
      this.config.sharedOpenSearchDomainArn = await getExport(
        `${this.config.project}-sharedOpenSearchDomainArn`,
      );
      this.config.sharedOpenSearchDomainEndpoint = await getExport(
        `${this.config.project}-sharedOpenSearchDomainEndpoint`,
      );
    }
  }
}
