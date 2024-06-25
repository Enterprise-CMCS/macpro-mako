import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { CdkExport } from "./cdk-export-construct";

interface NetworkingStackProps extends cdk.NestedStackProps {
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
    const parentName = this.node.id;
    const stackName = this.nestedStackResource!.logicalId;
    try {
      const parentName = this.node.id;
      const stackName = this.nestedStackResource!.logicalId;
      const { vpcInfo } = props;

      const vpc = Vpc.fromLookup(this, "MyVpc", {
        vpcId: vpcInfo.id,
      });

      const lambdaSecurityGroup = new SecurityGroup(
        this,
        "LambdaSecurityGroup",
        {
          vpc,
          description: `Outbound permissive sg for lambdas in ${this.node.id}.`,
          allowAllOutbound: true, // Set to false to customize egress rules
        },
      );

      lambdaSecurityGroup.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
      new CdkExport(
        this,
        parentName,
        stackName,
        "lambdaSecurityGroupId",
        lambdaSecurityGroup.securityGroupId,
      );
    } catch (error) {
      console.error("Error initializing resources:", error);
      process.exit(1);
    }
  }
}
