import { NestedStack, NestedStackProps, Aws, RemovalPolicy } from "aws-cdk-lib";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

import { EmptyBuckets } from "local-constructs";
import { ClamScanScanner } from "local-constructs";

interface UploadsStackProps extends NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
}

export class UploadsStack extends NestedStack {
  public readonly attachmentsBucket: Bucket;
  constructor(scope: Construct, id: string, props: UploadsStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.attachmentsBucket = resources.attachmentsBucket;
  }

  private initializeResources(props: UploadsStackProps): {
    attachmentsBucket: Bucket;
  } {
    const { project, stage, stack, isDev } = props;
    const attachmentsBucketName = `${project}-${stage}-attachments-${Aws.ACCOUNT_ID}`;
    // S3 Buckets
    const attachmentsBucket = new Bucket(this, "AttachmentsBucket", {
      bucketName: attachmentsBucketName,
      versioned: true,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [
            HttpMethods.GET,
            HttpMethods.PUT,
            HttpMethods.POST,
            HttpMethods.DELETE,
            HttpMethods.HEAD,
          ],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
      removalPolicy: isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    });

    attachmentsBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ["s3:*"],
        resources: [
          attachmentsBucket.bucketArn,
          `${attachmentsBucket.bucketArn}/*`,
        ],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    const scanner = new ClamScanScanner(this, "ClamScan", {
      fileBucket: attachmentsBucket,
    });

    attachmentsBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
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

    new EmptyBuckets(this, "EmptyBuckets", {
      buckets: [attachmentsBucket, scanner.clamDefsBucket],
    });

    return { attachmentsBucket };
  }
}
