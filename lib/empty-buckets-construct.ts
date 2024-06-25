import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cr from "aws-cdk-lib/custom-resources";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

interface EmptyBucketsProps extends cdk.StackProps {
  buckets: s3.IBucket[];
}

export class EmptyBuckets extends Construct {
  constructor(scope: Construct, id: string, props: EmptyBucketsProps) {
    super(scope, id);

    const { buckets } = props;

    const emptyBucketsFunction = new NodejsFunction(
      this,
      "EmptyBucketsFunction",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "handler",
        entry: path.join(__dirname, "lambda", "emptyBuckets.ts"),
        timeout: cdk.Duration.minutes(15),
      },
    );

    const bucketArns = buckets.map((bucket) => bucket.bucketArn);

    buckets.forEach((bucket) => {
      bucket.grantReadWrite(emptyBucketsFunction);
    });

    emptyBucketsFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:ListBucket", "s3:ListBucketVersions"],
        resources: bucketArns,
      }),
    );

    const bucketNames = buckets.map((bucket) => bucket.bucketName);

    new cr.AwsCustomResource(this, "EmptyBucketsCustomResource", {
      onDelete: {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: emptyBucketsFunction.functionName,
          Payload: JSON.stringify({
            RequestType: "Delete",
            ResourceProperties: {
              Buckets: bucketNames,
            },
          }),
        },
        physicalResourceId: cr.PhysicalResourceId.of("empty-buckets-resource"),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ["lambda:InvokeFunction"],
          resources: [emptyBucketsFunction.functionArn],
        }),
      ]),
    });
  }
}
