import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as LC from "local-constructs";

interface UploadsStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  attachmentsBucketName: string;
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
    const { attachmentsBucketName, isDev } = props;

    let attachmentsBucket: cdk.aws_s3.Bucket;

    if (!isDev) {
      // For permanent environments: Create bucket if it doesn't exist, import if it does
      attachmentsBucket = new cdk.aws_s3.Bucket(this, "AttachmentsBucket", {
        bucketName: attachmentsBucketName,
        versioned: true,
        encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
        publicReadAccess: false,
        blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep bucket on stack deletion
        autoDeleteObjects: false, // Preserve data
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
      });

      // Deny insecure requests to the bucket
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
    } else {
      // For dev environments: Import bucket by name (uses main bucket for shared dev data)
      attachmentsBucket = cdk.aws_s3.Bucket.fromBucketName(
        this,
        "AttachmentsBucket",
        attachmentsBucketName,
      ) as cdk.aws_s3.Bucket;
    }

    // Set up ClamAV scanner (works with both created and imported bucket references)
    const scanner = new LC.ClamScanScanner(this, "ClamScan", {
      fileBucket: attachmentsBucket,
    });

    // Add virus scan security policy for permanent environments
    if (!isDev) {
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
    }

    // Note: For dev environments using imported buckets, policies are managed manually
    new LC.EmptyBuckets(this, "EmptyBuckets", {
      buckets: [],
    });

    return { attachmentsBucket };
  }
}
