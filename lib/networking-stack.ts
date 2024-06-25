import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { CdkExport } from "./cdk-export-construct";

interface NetworkingStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  vpcInfo: {
    id: string;
  };
}

export class NetworkingStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: NetworkingStackProps) {
    super(scope, id, props);
    this.initializeResources(props);
  }

  private async initializeResources(props: NetworkingStackProps) {
    const { project, stage, stack } = props;
    const { vpcInfo } = props;
    try {
      const vpc = Vpc.fromLookup(this, "MyVpc", {
        vpcId: vpcInfo.id,
      });

      const lambdaSecurityGroup = new SecurityGroup(
        this,
        `LambdaSecurityGroup`,
        {
          vpc,
          description: `Outbound permissive sg for lambdas in ${project}-${stage}.`,
          allowAllOutbound: true, // Set to false to customize egress rules
        },
      );

      lambdaSecurityGroup.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
      new CdkExport(
        this,
        project,
        stage,
        stack,
        "lambdaSecurityGroupId",
        lambdaSecurityGroup.securityGroupId,
      );
    } catch (error) {
      console.error("Error initializing resources:", error);
      process.exit(1);
    }
  }
}
