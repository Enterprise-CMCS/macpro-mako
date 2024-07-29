import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as LC from "local-constructs";

interface UiInfraStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  domainCertificateArn?: string;
  domainName?: string;
}

export class UiInfra extends cdk.NestedStack {
  public readonly distribution: cdk.aws_cloudfront.CloudFrontWebDistribution;
  public readonly applicationEndpointUrl: string;
  public readonly cloudfrontEndpointUrl: string;
  public readonly bucket: cdk.aws_s3.Bucket;

  constructor(scope: Construct, id: string, props: UiInfraStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.distribution = resources.distribution;
    this.applicationEndpointUrl = props.domainName
      ? `https://${props.domainName}/`
      : `https://${this.distribution.distributionDomainName}/`;
    this.cloudfrontEndpointUrl = `https://${this.distribution.distributionDomainName}`;
    this.bucket = resources.bucket;
  }

  private initializeResources(props: UiInfraStackProps): {
    distribution: cdk.aws_cloudfront.CloudFrontWebDistribution;
    bucket: cdk.aws_s3.Bucket;
  } {
    const { project, stage, domainCertificateArn, domainName } = props;

    const domainCertificate =
      domainCertificateArn && domainCertificateArn.trim()
        ? cdk.aws_certificatemanager.Certificate.fromCertificateArn(
            this,
            "Certificate",
            domainCertificateArn,
          )
        : null;

    const sanitizedDomainName =
      domainName && domainName.trim() ? domainName.trim() : null;

    // S3 Bucket for hosting static website
    const bucket = new cdk.aws_s3.Bucket(this, "S3Bucket", {
      bucketName: `${project}-${stage}-${cdk.Aws.ACCOUNT_ID}`,
      versioned: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Deny insecure requests to the bucket
    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    // S3 Bucket for CloudFront logs
    const loggingBucket = new cdk.aws_s3.Bucket(this, "LoggingBucket", {
      bucketName: `${project}-${stage}-cloudfront-logs-${cdk.Aws.ACCOUNT_ID}`,
      versioned: true,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      objectOwnership: cdk.aws_s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    });

    // Deny insecure requests to the bucket
    loggingBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [loggingBucket.bucketArn, `${loggingBucket.bucketArn}/*`],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    // Add bucket policy to allow CloudFront to write logs
    loggingBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [
          new cdk.aws_iam.ServicePrincipal("cloudfront.amazonaws.com"),
        ],
        actions: ["s3:PutObject"],
        resources: [`${loggingBucket.bucketArn}/*`],
      }),
    );

    // CloudFront Origin Access Identity
    const cloudFrontOAI = new cdk.aws_cloudfront.OriginAccessIdentity(
      this,
      "CloudFrontOAI",
      {
        comment: "OAI to prevent direct public access to the bucket",
      },
    );

    // HSTS Function
    const hstsFunction = new cdk.aws_cloudfront.Function(this, "HstsFunction", {
      comment: "This function adds headers to implement HSTS",
      code: cdk.aws_cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var response = event.response;
          var headers = response.headers;
          headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubdomains; preload'};
          return response;
        }
      `),
    });

    const waf = new LC.CloudFrontWaf(this, "WafConstruct", {
      name: `${project}-${stage}-${props.stack}`,
    });

    // CloudFront Distribution
    const viewerCertificate = domainCertificate
      ? cdk.aws_cloudfront.ViewerCertificate.fromAcmCertificate(
          domainCertificate,
          {
            aliases: sanitizedDomainName ? [sanitizedDomainName] : [],
            securityPolicy:
              cdk.aws_cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            sslMethod: cdk.aws_cloudfront.SSLMethod.SNI,
          },
        )
      : cdk.aws_cloudfront.ViewerCertificate.fromCloudFrontDefaultCertificate();

    const distribution = new cdk.aws_cloudfront.CloudFrontWebDistribution(
      this,
      "CloudFrontDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: cloudFrontOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                allowedMethods:
                  cdk.aws_cloudfront.CloudFrontAllowedMethods.GET_HEAD,
                viewerProtocolPolicy:
                  cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                functionAssociations: [
                  {
                    function: hstsFunction,
                    eventType:
                      cdk.aws_cloudfront.FunctionEventType.VIEWER_RESPONSE,
                  },
                ],
              },
            ],
          },
        ],
        comment: `CloudFront Distro for the static website hosted in S3 for ${project}-${stage}`,
        defaultRootObject: "index.html",
        httpVersion: cdk.aws_cloudfront.HttpVersion.HTTP2,
        viewerCertificate,
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
        webACLId: waf.webAcl.attrArn,
      },
    );

    const cloudwatchToS3 = new LC.CloudWatchToS3(
      this,
      "CloudWatchToS3Construct",
      {
        logGroup: waf.logGroup,
      },
    );

    new LC.EmptyBuckets(this, "EmptyBuckets", {
      buckets: [bucket, loggingBucket, cloudwatchToS3.logBucket],
    });

    return { distribution, bucket };
  }
}
