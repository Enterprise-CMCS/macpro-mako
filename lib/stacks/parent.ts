import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CloudWatchLogsResourcePolicy } from "local-constructs";

import { DeploymentConfigProperties } from "./deployment-config";
import * as Stacks from "../stacks";

export class ParentStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & DeploymentConfigProperties,
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

    const vpc = cdk.aws_ec2.Vpc.fromLookup(this, "Vpc", {
      vpcName: props.vpcName,
    });
    const privateSubnets = sortSubnets(vpc.privateSubnets).slice(0, 3);

    if (!props.isDev || props.stage === "main") {
      new CloudWatchLogsResourcePolicy(this, "logPolicy", {
        project: props.project,
      });
    }

    const networkingStack = new Stacks.Networking(this, "networking", {
      ...commonProps,
      stack: "networking",
      vpc,
    });

    const alertsStack = new Stacks.Alerts(this, "alerts", {
      ...commonProps,
      stack: "alerts",
    });

    const uiInfraStack = new Stacks.UiInfra(this, "ui-infra", {
      ...commonProps,
      stack: "ui-infra",
      isDev: props.isDev,
      domainCertificateArn: props.domainCertificateArn,
      domainName: props.domainName,
    });

    const uploadsStack = new Stacks.Uploads(this, "uploads", {
      ...commonProps,
      stack: "uploads",
    });

    const dataStack = new Stacks.Data(this, "data", {
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

    const apiStack = new Stacks.Api(this, "api", {
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

    const authStack = new Stacks.Auth(this, "auth", {
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

    const emailStack = new Stacks.Email(this, "email", {
      ...commonProps,
      stack: "email",
      vpc,
      privateSubnets,
      brokerString: props.brokerString,
      topicNamespace,
      indexNamespace,
      lambdaSecurityGroupId:
        networkingStack.lambdaSecurityGroup.securityGroupId,
      applicationEndpoint: uiInfraStack.applicationEndpointUrl,
      emailAddressLookupSecretName: props.emailAddressLookupSecretName,
      emailIdentityDomain: props.emailIdentityDomain,
      lambdaSecurityGroup: networkingStack.lambdaSecurityGroup,
      emailFromIdentity: props.emailFromIdentity,
    });

    new cdk.aws_ssm.StringParameter(this, "DeploymentOutput", {
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

    new cdk.aws_ssm.StringParameter(this, "DeploymentConfig", {
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

function sortSubnets(subnets: cdk.aws_ec2.ISubnet[]): cdk.aws_ec2.ISubnet[] {
  return subnets.sort((a, b) => {
    const sizeA = getSubnetSize(a.ipv4CidrBlock);
    const sizeB = getSubnetSize(b.ipv4CidrBlock);

    if (sizeA !== sizeB) {
      return sizeB - sizeA; // Sort by size in decreasing order
    }

    return a.subnetId.localeCompare(b.subnetId); // Sort by name if sizes are equal
  });
}
