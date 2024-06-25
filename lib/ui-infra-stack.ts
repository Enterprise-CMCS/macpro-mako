import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  PolicyStatement,
  Effect,
  ServicePrincipal,
  AccountRootPrincipal,
} from "aws-cdk-lib/aws-iam";
import {
  Bucket,
  BucketEncryption,
  BlockPublicAccess,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  Function,
  FunctionCode,
  HttpVersion,
  OriginAccessIdentity,
  ViewerCertificate,
  FunctionEventType,
} from "aws-cdk-lib/aws-cloudfront";
import { EmptyBuckets } from "./empty-buckets-construct";
import { CdkExport } from "./cdk-export-construct";

interface UiInfraStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
}

export class UiInfraStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: UiInfraStackProps) {
    super(scope, id, props);
    const { project, stage, stack } = props;
    // S3 Bucket for hosting static website
    const s3Bucket = new Bucket(this, "S3Bucket", {
      bucketName: `${project}-${stage}-${cdk.Aws.ACCOUNT_ID}`,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // need to put a switch for higher envs
    });

    // S3 Bucket for CloudFront logs
    const loggingBucket = new Bucket(this, "LoggingBucket", {
      bucketName: `${project}-${stage}-cloudfront-logs-${cdk.Aws.ACCOUNT_ID}`,
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // need to put a switch for higher envs
      objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED,
    });

    // Add bucket policy to allow CloudFront to write logs
    const loggingBucketPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
      actions: ["s3:PutObject"],
      resources: [`${loggingBucket.bucketArn}/*`],
    });
    loggingBucket.addToResourcePolicy(loggingBucketPolicy);

    // Deny insecure requests to the bucket
    const denyInsecureRequestsPolicy = new PolicyStatement({
      effect: Effect.DENY,
      principals: [new AccountRootPrincipal()],
      actions: ["s3:*"],
      resources: [loggingBucket.bucketArn, `${loggingBucket.bucketArn}/*`],
      conditions: {
        Bool: { "aws:SecureTransport": "false" },
      },
    });
    loggingBucket.addToResourcePolicy(denyInsecureRequestsPolicy);

    // CloudFront Origin Access Identity
    const cloudFrontOAI = new OriginAccessIdentity(this, "CloudFrontOAI", {
      comment: "OAI to prevent direct public access to the bucket",
    });

    // HSTS Function
    const hstsFunction = new Function(this, "HstsFunction", {
      comment: "This function adds headers to implement HSTS",
      code: FunctionCode.fromInline(`
        function handler(event) {
          var response = event.response;
          var headers = response.headers;
          headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubdomains; preload'};
          return response;
        }
      `),
    });

    // CloudFront Distribution
    const distribution = new CloudFrontWebDistribution(
      this,
      "CloudFrontDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: s3Bucket,
              originAccessIdentity: cloudFrontOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                allowedMethods: CloudFrontAllowedMethods.GET_HEAD,
                viewerProtocolPolicy:
                  cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                functionAssociations: [
                  {
                    function: hstsFunction,
                    eventType: FunctionEventType.VIEWER_RESPONSE,
                  },
                ],
              },
            ],
          },
        ],
        comment: `CloudFront Distro for the static website hosted in S3 for ${project}-${stage}`,
        defaultRootObject: "index.html",
        httpVersion: HttpVersion.HTTP2,
        viewerCertificate: ViewerCertificate.fromCloudFrontDefaultCertificate(), // need switch
        loggingConfig: {
          bucket: loggingBucket,
          includeCookies: false,
          prefix: "cloudfront-logs/",
        },
        errorConfigurations: [
          {
            errorCode: 403,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 300,
          },
          {
            errorCode: 404,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 300,
          },
        ],
      },
    );

    new EmptyBuckets(this, "EmptyBuckets", {
      buckets: [s3Bucket, loggingBucket],
    });

    new CdkExport(
      this,
      project,
      stage,
      stack,
      "s3BucketName",
      s3Bucket.bucketName,
    );
    new CdkExport(
      this,
      project,
      stage,
      stack,
      "cloudfrontDistributionId",
      distribution.distributionId,
    );
    new CdkExport(
      this,
      project,
      stage,
      stack,
      "cloudfrontEndpointUrl",
      `https://${distribution.distributionDomainName}`,
    );
    new CdkExport(
      this,
      project,
      stage,
      stack,
      "applicationEndpointUrl",
      `https://${distribution.distributionDomainName}/`,
    );
  }
}
