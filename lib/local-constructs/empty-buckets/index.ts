import { join } from "path";

import { Duration, RemovalPolicy, StackProps } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import {
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface EmptyBucketsProps extends StackProps {
  buckets: IBucket[];
}

export class EmptyBuckets extends Construct {
  constructor(scope: Construct, id: string, props: EmptyBucketsProps) {
    super(scope, id);

    const { buckets } = props;

    const bucketArns = buckets.map((bucket) => bucket.bucketArn);
    const bucketNames = buckets.map((bucket) => bucket.bucketName);

    const lambdaRole = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
      ],
      inlinePolicies: {
        LambdaPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                "s3:ListBucket",
                "s3:ListBucketVersions",
                "s3:PutBucketPolicy",
                "s3:GetBucketPolicy",
                "s3:DeleteObject",
                "s3:DeleteObjectVersion",
              ],
              resources: bucketArns,
            }),
            new PolicyStatement({
              effect: Effect.DENY,
              actions: ["logs:CreateLogGroup"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    const lambdaLogGroup = new LogGroup(this, "LambdaLogGroup", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambda = new NodejsFunction(this, "Lambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      depsLockFilePath: join(__dirname, "../../../bun.lockb"),
      entry: join(__dirname, "src", "emptyBuckets.ts"),
      timeout: Duration.minutes(15),
      logGroup: lambdaLogGroup,
      role: lambdaRole,
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    buckets.forEach((bucket) => {
      bucket.grantReadWrite(lambda);
    });

    const logGroup = new LogGroup(this, "CustomResourceLogGroup", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const customResource = new AwsCustomResource(this, "CustomResource", {
      onDelete: {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: lambda.functionName,
          Payload: JSON.stringify({
            RequestType: "Delete",
            ResourceProperties: {
              Buckets: bucketNames,
            },
          }),
        },
        physicalResourceId: PhysicalResourceId.of("empty-buckets-resource"),
      },
      logGroup,
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          actions: ["lambda:InvokeFunction"],
          resources: [lambda.functionArn],
        }),
        new PolicyStatement({
          effect: Effect.DENY,
          actions: ["logs:CreateLogGroup"],
          resources: ["*"],
        }),
      ]),
    });
    const policy = customResource.node.findChild("CustomResourcePolicy");
    customResource.node.addDependency(policy);
    logGroup.node.addDependency(policy);
  }
}
