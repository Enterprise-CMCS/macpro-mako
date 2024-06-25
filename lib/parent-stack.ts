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
      vpcInfo,
      brokerString,
      onemacLegacyS3AccessRoleArn,
      dbInfo,
      launchdarklySDKKey,
      idmInfo,
    } = props;

    const isDev = !["master", "val", "production"].includes(stage);

    const networkingStack = new NetworkingStack(this, "networking", {
      project,
      stage,
      stack: "networking",
      isDev,
      vpcInfo,
    });

    const alertsStack = new AlertsStack(this, "alerts", {
      project,
      stage,
      stack: "alerts",
      isDev,
    });

    const uiInfraStack = new UiInfraStack(this, "ui-infra", {
      project,
      stage,
      stack: "ui-infra",
      isDev,
    });

    const uploadsStack = new UploadsStack(this, "uploads", {
      project,
      stage,
      stack: "uploads",
      isDev,
    });

    const dataStack = new DataStack(this, "data", {
      project,
      stage,
      stack: "data",
      isDev,
      vpcInfo,
      brokerString,
    });
    dataStack.addDependency(networkingStack);

    const apiStack = new ApiStack(this, "api", {
      project,
      stage,
      stack: "api",
      isDev,
      vpcInfo,
      brokerString,
      dbInfo,
      onemacLegacyS3AccessRoleArn,
    });
    apiStack.addDependency(alertsStack);
    apiStack.addDependency(dataStack);
    apiStack.addDependency(uploadsStack);
    apiStack.addDependency(networkingStack);

    const authStack = new AuthStack(this, "auth", {
      project,
      stage,
      stack: "auth",
      isDev,
    });
    authStack.addDependency(uiInfraStack);
    authStack.addDependency(apiStack);
    authStack.addDependency(networkingStack);
  }
}
