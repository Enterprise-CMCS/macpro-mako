import { Fn, Stack, StackProps } from "aws-cdk-lib";
import { Vpc, ISubnet } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

import { DeploymentConfigProperties } from "./deployment-config";
import { AlertsStack } from "./alerts-stack";
import { ApiStack } from "./api-stack";
import { AuthStack } from "./auth-stack";
import { DataStack } from "./data-stack";
import { NetworkingStack } from "./networking-stack";
import { UiInfraStack } from "./ui-infra-stack";
import { UploadsStack } from "./uploads-stack";

import { CloudWatchLogsResourcePolicy } from "local-constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { EmailStack } from "./email-stack";

export class ParentStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & DeploymentConfigProperties,
  ) {
    super(scope, id, props);

    const commonProps = {
      project: props.project,
      stage: props.stage,
      isDev: props.isDev,
    };
    const topicNamespace = props.isDev
      ? `--${props.project}--${props.stage}--`
      : "";
    const indexNamespace = props.stage;

    const vpc = Vpc.fromLookup(this, "Vpc", {
      vpcName: props.vpcName,
    });
    const privateSubnets = sortSubnets(vpc.privateSubnets);

    if (!props.isDev || props.stage === "main") {
      new CloudWatchLogsResourcePolicy(this, "logPolicy", {
        project: props.project,
      });
    }

    const networkingStack = new NetworkingStack(this, "networking", {
      ...commonProps,
      stack: "networking",
      vpc,
    });

    const alertsStack = new AlertsStack(this, "alerts", {
      ...commonProps,
      stack: "alerts",
    });

    const uiInfraStack = new UiInfraStack(this, "ui-infra", {
      ...commonProps,
      stack: "ui-infra",
      isDev: props.isDev,
      domainCertificateArn: props.domainCertificateArn,
      domainName: props.domainName,
    });

    const uploadsStack = new UploadsStack(this, "uploads", {
      ...commonProps,
      stack: "uploads",
    });

    const dataStack = new DataStack(this, "data", {
      ...commonProps,
      stack: "data",
      vpc,
      privateSubnets,
      brokerString: props.brokerString,
      lambdaSecurityGroup: networkingStack.lambdaSecurityGroup,
      topicNamespace,
      indexNamespace,
      devPasswordArn: props.devPasswordArn,
      sharedOpenSearchDomainArn: props.sharedOpenSearchDomainArn,
      sharedOpenSearchDomainEndpoint: props.sharedOpenSearchDomainEndpoint,
    });

    const apiStack = new ApiStack(this, "api", {
      ...commonProps,
      stack: "api",
      vpc,
      privateSubnets,
      brokerString: props.brokerString,
      dbInfoSecretName: props.dbInfoSecretName,
      legacyS3AccessRoleArn: props.legacyS3AccessRoleArn,
      lambdaSecurityGroup: networkingStack.lambdaSecurityGroup,
      topicNamespace,
      indexNamespace,
      openSearchDomainArn: dataStack.openSearchDomainArn,
      openSearchDomainEndpoint: dataStack.openSearchDomainEndpoint,
      alertsTopic: alertsStack.topic,
      attachmentsBucket: uploadsStack.attachmentsBucket,
    });

    const authStack = new AuthStack(this, "auth", {
      ...commonProps,
      stack: "auth",
      apiGateway: apiStack.apiGateway,
      applicationEndpointUrl: uiInfraStack.applicationEndpointUrl,
      vpc,
      privateSubnets,
      lambdaSecurityGroup: networkingStack.lambdaSecurityGroup,
      idmEnable: props.idmEnable,
      idmClientId: props.idmClientId,
      idmClientIssuer: props.idmClientIssuer,
      idmAuthzApiEndpoint: props.idmAuthzApiEndpoint,
      idmAuthzApiKeyArn: props.idmAuthzApiKeyArn,
      idmClientSecretArn: props.idmClientSecretArn,
      devPasswordArn: props.devPasswordArn,
    });

    const emailStack = new EmailStack(this, "email", {
      ...commonProps,
      stack: "email",
      vpc,
      privateSubnets,
      brokerString: props.brokerString,
      topicNamespace,
      osDomainArn: dataStack.openSearchDomainArn,
      lambdaSecurityGroupId:
        networkingStack.lambdaSecurityGroup.securityGroupId,
      applicationEndpoint: uiInfraStack.applicationEndpointUrl,
      cognitoUserPoolId: authStack.userPool.userPoolId,
    });

    new StringParameter(this, "DeploymentOutput", {
      parameterName: `/${props.project}/${props.stage}/deployment-output`,
      stringValue: JSON.stringify({
        apiGatewayRestApiUrl: apiStack.apiGatewayUrl,
        identityPoolId: authStack.identityPool.attrId,
        userPoolId: authStack.userPool.userPoolId,
        userPoolClientId: authStack.userPoolClient.attrClientId,
        userPoolClientDomain: authStack.userPoolClientDomain,
        applicationEndpointUrl: uiInfraStack.applicationEndpointUrl,
        s3BucketName: uiInfraStack.bucket.bucketName,
        cloudfrontDistributionId: uiInfraStack.distribution.distributionId,
        idmHomeUrl: props.idmHomeUrl,
        kibanaUrl: `https://${dataStack.openSearchDomainEndpoint}/_dashboards`,
      }),
      description: `Deployment output for the ${props.stage} environment.`,
    });

    new StringParameter(this, "DeploymentConfig", {
      parameterName: `/${props.project}/${props.stage}/deployment-config`,
      stringValue: JSON.stringify(props),
      description: `Deployment config for the ${props.stage} environment.`,
    });

    if (props.stage === "main") {
      this.exportValue(dataStack.openSearchDomainEndpoint, {
        name: `${props.project}-sharedOpenSearchDomainEndpoint`,
      });
      this.exportValue(dataStack.openSearchDomainArn, {
        name: `${props.project}-sharedOpenSearchDomainArn`,
      });
    }
  }
}

function getSubnetSize(cidrBlock: string): number {
  const subnetMask = parseInt(cidrBlock.split("/")[1], 10);
  return Math.pow(2, 32 - subnetMask);
}

function sortSubnets(subnets: ISubnet[]): ISubnet[] {
  return subnets.sort((a, b) => {
    const sizeA = getSubnetSize(a.ipv4CidrBlock);
    const sizeB = getSubnetSize(b.ipv4CidrBlock);

    if (sizeA !== sizeB) {
      return sizeB - sizeA; // Sort by size in decreasing order
    }

    return a.subnetId.localeCompare(b.subnetId); // Sort by name if sizes are equal
  });
}
