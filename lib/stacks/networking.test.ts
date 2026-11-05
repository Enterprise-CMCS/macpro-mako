import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";

import { Networking } from "./networking";

describe("Networking stack", () => {
  it("uses the stage-specific Lambda security group name for dev stages", () => {
    const app = new cdk.App();
    const parent = new cdk.Stack(app, "NetworkingParentTest");
    const vpc = cdk.aws_ec2.Vpc.fromVpcAttributes(parent, "Vpc", {
      availabilityZones: ["us-east-1a"],
      privateSubnetIds: ["subnet-00000001"],
      vpcId: "vpc-00000001",
    });
    const networking = new Networking(parent, "networking", {
      project: "mako",
      stage: "feature-stage",
      stack: "networking",
      isDev: true,
      vpc,
    });

    Template.fromStack(networking).hasResourceProperties("AWS::EC2::SecurityGroup", {
      GroupName: "mako-feature-stage-lambda-sg",
    });
  });
});
