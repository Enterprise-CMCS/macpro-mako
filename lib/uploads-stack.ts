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

interface UploadsStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
}

export class UploadsStack extends cdk.NestedStack {
  public readonly attachmentsBucket: s3.Bucket;
  constructor(scope: Construct, id: string, props: UploadsStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.attachmentsBucket = resources.attachmentsBucket;
  }

  private initializeResources(props: UploadsStackProps): {
    attachmentsBucket: s3.Bucket;
  } {
    const { project, stage, stack, isDev } = props;
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

    return { attachmentsBucket };
  }
}
