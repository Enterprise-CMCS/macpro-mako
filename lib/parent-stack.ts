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

    const env = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };

    const networkingStack = new NetworkingStack(
      this,
      `${project}-networking-${stage}`,
      {
        vpcInfo,
      }
    );
    const alertsStack = new AlertsStack(this, `${project}-alerts-${stage}`, {});
    const uiInfraStack = new UiInfraStack(
      this,
      `${project}-ui-infra-${stage}`,
      { project, stage }
    );
    const uploadsStack = new UploadsStack(
      this,
      `${project}-uploads-${stage}`,
      {}
    );
    const dataStack = new DataStack(this, `${project}-data-${stage}`, {
      project,
      stage,
      vpcInfo,
      brokerString,
    });

    dataStack.addDependency(networkingStack);

    const apiStack = new ApiStack(this, `${project}-api-${stage}`, {
      project,
      stage,
      vpcInfo,
      brokerString,
      dbInfo,
      onemacLegacyS3AccessRoleArn,
    });

    apiStack.addDependency(alertsStack);
    apiStack.addDependency(dataStack);
    apiStack.addDependency(uploadsStack);
    apiStack.addDependency(networkingStack);

    const authStack = new AuthStack(this, `${project}-auth-${stage}`, {
      project,
      stage,
    });

    authStack.addDependency(uiInfraStack);
    authStack.addDependency(apiStack);
    authStack.addDependency(networkingStack);
  }
}
