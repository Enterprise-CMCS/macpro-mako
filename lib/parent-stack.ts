import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NetworkingStack } from "./networking-stack";
import { AlertsStack } from "./alerts-stack";
import { UiInfraStack } from "./ui-infra-stack";
import { UploadsStack } from "./uploads-stack";
import { DataStack } from "./data-stack";
import { ApiStack } from "./api-stack";
import { AuthStack } from "./auth-stack";

interface ParentStackProps extends cdk.StackProps {
  project: string;
  stage: string;
  isDev: boolean;
  vpcInfo: any;
  brokerString: any;
  onemacLegacyS3AccessRoleArn: any;
  dbInfo: any;
  launchdarklySDKKey: any;
  idmInfo: any;
}

export class ParentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ParentStackProps) {
    super(scope, id, props);

    const {
      project,
      stage,
      isDev,
      vpcInfo,
      brokerString,
      onemacLegacyS3AccessRoleArn,
      dbInfo,
      launchdarklySDKKey,
      idmInfo,
    } = props;

    const commonProps = { project, stage, isDev };
    const topicNamespace = isDev ? `--${project}--${stage}--` : "";

    const networkingStack = new NetworkingStack(this, "networking", {
      ...commonProps,
      stack: "networking",
      vpcInfo,
    });

    const alertsStack = new AlertsStack(this, "alerts", {
      ...commonProps,
      stack: "alerts",
    });

    const uiInfraStack = new UiInfraStack(this, "ui-infra", {
      ...commonProps,
      stack: "ui-infra",
    });

    const uploadsStack = new UploadsStack(this, "uploads", {
      ...commonProps,
      stack: "uploads",
    });

    const dataStack = new DataStack(this, "data", {
      ...commonProps,
      stack: "data",
      vpcInfo,
      brokerString,
      lambdaSecurityGroup: networkingStack.lambdaSecurityGroup,
      topicNamespace,
    });

    const apiStack = new ApiStack(this, "api", {
      ...commonProps,
      stack: "api",
      vpcInfo,
      brokerString,
      dbInfo,
      onemacLegacyS3AccessRoleArn,
      lambdaSecurityGroup: networkingStack.lambdaSecurityGroup,
      topicNamespace,
      openSearchDomain: dataStack.openSearchDomain,
      openSearchDomainEndpoint: dataStack.openSearchDomainEndpoint,
      alertsTopic: alertsStack.topic,
      attachmentsBucket: uploadsStack.attachmentsBucket,
    });

    // const authStack = new AuthStack(this, "auth", {
    //   ...commonProps,
    //   stack: "auth",
    // });
    // authStack.addDependency(uiInfraStack);
    // authStack.addDependency(apiStack);
    // authStack.addDependency(networkingStack);
  }
}
