import * as cdk from "aws-cdk-lib";
import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { EmptyBuckets } from "./empty-buckets-construct";
import { CdkExport } from "./cdk-export-construct";

interface UploadsStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
}

export class UploadsStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: UploadsStackProps) {
    super(scope, id, props);
    const { project, stage, stack } = props;
    const attachmentsBucketName = `${project}-${stage}-attachments-${cdk.Aws.ACCOUNT_ID}`;
    // S3 Buckets
    const attachmentsBucket = new s3.Bucket(this, "AttachmentsBucket", {
      bucketName: attachmentsBucketName,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
    });

    new EmptyBuckets(this, "EmptyBuckets", {
      buckets: [attachmentsBucket],
    });

    new CdkExport(
      this,
      project,
      stage,
      stack,
      "attachmentsBucketName",
      attachmentsBucket.bucketName,
    );
    new CdkExport(
      this,
      project,
      stage,
      stack,
      "attachmentsBucketArn",
      attachmentsBucket.bucketArn,
    );
    new CdkExport(
      this,
      project,
      stage,
      stack,
      "attachmentsBucketRegion",
      this.region,
    );
  }
}
