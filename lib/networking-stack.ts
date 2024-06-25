import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";

interface NetworkingStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpcInfo: {
    id: string;
  };
}

export class NetworkingStack extends cdk.NestedStack {
  public readonly lambdaSecurityGroup: SecurityGroup;
  constructor(scope: Construct, id: string, props: NetworkingStackProps) {
    super(scope, id, props);
    this.lambdaSecurityGroup = this.initializeResources(props);
  }

  private initializeResources(props: NetworkingStackProps): SecurityGroup {
    const { project, stage, stack, isDev } = props;
    const { vpcInfo } = props;
    const vpc = Vpc.fromLookup(this, "MyVpc", {
      vpcId: vpcInfo.id,
    });

    const lambdaSecurityGroup = new SecurityGroup(this, `LambdaSecurityGroup`, {
      vpc,
      description: `Outbound permissive sg for lambdas in ${project}-${stage}.`,
      allowAllOutbound: true, // Set to false to customize egress rules
    });

    lambdaSecurityGroup.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    return lambdaSecurityGroup;
  }
}
