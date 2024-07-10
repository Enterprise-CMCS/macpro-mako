import { NestedStack, NestedStackProps, Aws, RemovalPolicy } from "aws-cdk-lib";
import {
  AccountRootPrincipal,
  Effect,
  PolicyStatement,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  Function,
  FunctionCode,
  FunctionEventType,
  HttpVersion,
  OriginAccessIdentity,
  SecurityPolicyProtocol,
  SSLMethod,
  ViewerCertificate,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

import { CloudWatchToS3 } from "local-constructs";
import { EmptyBuckets } from "local-constructs";
import { CloudFrontWaf } from "local-constructs";

interface UiInfraStackProps extends NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  domainCertificateArn?: string;
  domainName?: string;
}

export class UiInfraStack extends NestedStack {
  public readonly distribution: CloudFrontWebDistribution;
  public readonly applicationEndpointUrl: string;
  public readonly cloudfrontEndpointUrl: string;
  public readonly bucket: Bucket;

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
    distribution: CloudFrontWebDistribution;
    bucket: Bucket;
  } {
    const { project, stage, stack, isDev, domainCertificateArn, domainName } =
      props;

    const domainCertificate =
      domainCertificateArn && domainCertificateArn.trim()
        ? Certificate.fromCertificateArn(
            this,
            "Certificate",
            domainCertificateArn,
          )
        : null;

    // Ensure the domain name is valid
    const sanitizedDomainName =
      domainName && domainName.trim() ? domainName.trim() : null;

    // S3 Bucket for hosting static website
    const bucket = new Bucket(this, "S3Bucket", {
      bucketName: `${project}-${stage}-${Aws.ACCOUNT_ID}`,
      versioned: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Deny insecure requests to the bucket
    bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AccountRootPrincipal()],
        actions: ["s3:*"],
        resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    // S3 Bucket for CloudFront logs
    const loggingBucket = new Bucket(this, "LoggingBucket", {
      bucketName: `${project}-${stage}-cloudfront-logs-${Aws.ACCOUNT_ID}`,
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED,
    });

    // Deny insecure requests to the bucket
    loggingBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AccountRootPrincipal()],
        actions: ["s3:*"],
        resources: [loggingBucket.bucketArn, `${loggingBucket.bucketArn}/*`],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    // Add bucket policy to allow CloudFront to write logs
    loggingBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        actions: ["s3:PutObject"],
        resources: [`${loggingBucket.bucketArn}/*`],
      }),
    );

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

    const waf = new CloudFrontWaf(this, "WafConstruct", {
      name: `${project}-${stage}-${stack}`,
    });

    // CloudFront Distribution
    const viewerCertificate = domainCertificate
      ? ViewerCertificate.fromAcmCertificate(domainCertificate, {
          aliases: sanitizedDomainName ? [sanitizedDomainName] : [],
          securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021,
          sslMethod: SSLMethod.SNI,
        })
      : ViewerCertificate.fromCloudFrontDefaultCertificate();

    const distribution = new CloudFrontWebDistribution(
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
                allowedMethods: CloudFrontAllowedMethods.GET_HEAD,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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

    const cloudwatchToS3 = new CloudWatchToS3(this, "CloudWatchToS3Construct", {
      logGroup: waf.logGroup,
    });

    new EmptyBuckets(this, "EmptyBuckets", {
      buckets: [bucket, loggingBucket, cloudwatchToS3.logBucket],
    });

    return { distribution, bucket };
  }
}
