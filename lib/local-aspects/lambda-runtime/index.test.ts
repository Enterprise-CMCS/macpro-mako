import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { describe, expect, it } from "vitest";

import { LambdaRuntimeMinVersionAspect } from ".";

function runtimeAfterAspect(runtime: lambda.Runtime): string {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new lambda.Function(stack, "Fn", {
    runtime,
    handler: "index.handler",
    code: lambda.Code.fromInline("exports.handler = () => {}"),
  });

  cdk.Aspects.of(app).add(new LambdaRuntimeMinVersionAspect());

  const template = cdk.assertions.Template.fromStack(stack);
  const functions = template.findResources("AWS::Lambda::Function");
  const fnKey = Object.keys(functions)[0];
  return functions[fnKey].Properties.Runtime as string;
}

describe("LambdaRuntimeMinVersionAspect", () => {
  it("upgrades a Node 20 function to Node 22", () => {
    // Arrange
    const outdatedRuntime = lambda.Runtime.NODEJS_20_X;

    // Act
    const result = runtimeAfterAspect(outdatedRuntime);

    // Assert
    expect(result).toBe("nodejs22.x");
  });

  it("leaves a Node 22 function unchanged", () => {
    // Arrange
    const currentRuntime = lambda.Runtime.NODEJS_22_X;

    // Act
    const result = runtimeAfterAspect(currentRuntime);

    // Assert
    expect(result).toBe("nodejs22.x");
  });

  it("does not throw when visiting non-Lambda resources", () => {
    // Arrange
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "NoLambdaStack");
    new cdk.aws_s3.Bucket(stack, "Bucket");
    cdk.Aspects.of(app).add(new LambdaRuntimeMinVersionAspect());

    // Act / Assert
    expect(() => cdk.assertions.Template.fromStack(stack)).not.toThrow();
  });
});
