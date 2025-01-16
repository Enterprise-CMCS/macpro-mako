import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as LC from "local-constructs";

interface UploadsStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
}

export class Uploads extends cdk.NestedStack {
  public readonly attachmentsBucket: cdk.aws_s3.Bucket;

  constructor(scope: Construct, id: string, props: UploadsStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.attachmentsBucket = resources.attachmentsBucket;
  }

  private initializeResources(props: UploadsStackProps): {
    attachmentsBucket: cdk.aws_s3.Bucket;
  } {
    const { project, stage, isDev } = props;
    const attachmentsBucketName = `${project}-${stage}-attachments-${cdk.Aws.ACCOUNT_ID}`;

    // S3 Buckets
    const attachmentsBucket = new cdk.aws_s3.Bucket(this, "AttachmentsBucket", {
      bucketName: attachmentsBucketName,
      versioned: true,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [
            cdk.aws_s3.HttpMethods.GET,
            cdk.aws_s3.HttpMethods.PUT,
            cdk.aws_s3.HttpMethods.POST,
            cdk.aws_s3.HttpMethods.DELETE,
            cdk.aws_s3.HttpMethods.HEAD,
          ],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
      removalPolicy: isDev ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: isDev,
    });

    attachmentsBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [attachmentsBucket.bucketArn, `${attachmentsBucket.bucketArn}/*`],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    const scanner = new LC.ClamScanScanner(this, "ClamScan", {
      fileBucket: attachmentsBucket,
    });

    attachmentsBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        actions: ["s3:GetObject"],
        resources: [`${attachmentsBucket.bucketArn}/*`],
        conditions: {
          StringNotEquals: {
            "s3:ExistingObjectTag/virusScanStatus": "CLEAN",
            "aws:PrincipalArn": scanner.lambdaRole.roleArn,
          },
        },
      }),
    );

    new LC.EmptyBuckets(this, "EmptyBuckets", {
      buckets: [],
    });

    return { attachmentsBucket };
  }
}
