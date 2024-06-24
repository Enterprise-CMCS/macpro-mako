import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { cdkExport } from "./utils/cdk-export";

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
    try {
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
        }
      );

      lambdaSecurityGroup.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

      cdkExport(
        this,
        this.node.id,
        "lambdaSecurityGroupId",
        lambdaSecurityGroup.securityGroupId
      );
    } catch (error) {
      console.error("Error initializing resources:", error);
      process.exit(1);
    }
  }
}
