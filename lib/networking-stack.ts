import { NestedStack, NestedStackProps, RemovalPolicy } from "aws-cdk-lib";
import { IVpc, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface NetworkingStackProps extends NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpc: IVpc;
}

export class NetworkingStack extends NestedStack {
  public readonly lambdaSecurityGroup: SecurityGroup;
  constructor(scope: Construct, id: string, props: NetworkingStackProps) {
    super(scope, id, props);
    this.lambdaSecurityGroup = this.initializeResources(props);
  }

  private initializeResources(props: NetworkingStackProps): SecurityGroup {
    const { project, stage, stack, isDev } = props;
    const { vpc } = props;

    const lambdaSecurityGroup = new SecurityGroup(this, `LambdaSecurityGroup`, {
      vpc,
      description: `Outbound permissive sg for lambdas in ${project}-${stage}.`,
      allowAllOutbound: true, // Set to false to customize egress rules
    });

    lambdaSecurityGroup.applyRemovalPolicy(RemovalPolicy.RETAIN);

    return lambdaSecurityGroup;
  }
}
