import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface NetworkingStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpc: cdk.aws_ec2.IVpc;
}

export class Networking extends cdk.NestedStack {
  public readonly lambdaSecurityGroup: cdk.aws_ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkingStackProps) {
    super(scope, id, props);
    this.lambdaSecurityGroup = this.initializeResources(props);
  }

  private initializeResources(props: NetworkingStackProps): cdk.aws_ec2.SecurityGroup {
    const { project, stage, vpc, isDev } = props;

    const lambdaSecurityGroup = new cdk.aws_ec2.SecurityGroup(this, `LambdaSecurityGroup`, {
      vpc,
      description: `Outbound permissive sg for lambdas in ${project}-${stage}.`,
      allowAllOutbound: true, // Set to false to customize egress rules
      ...(isDev ? {} : { securityGroupName: `${project}-${stage}-lambda-sg` }),
    });

    lambdaSecurityGroup.applyRemovalPolicy(
      isDev ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
    );

    return lambdaSecurityGroup;
  }
}
