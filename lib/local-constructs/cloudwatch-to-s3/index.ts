import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { CfnDeliveryStream } from "aws-cdk-lib/aws-kinesisfirehose";
import {
  Role,
  ServicePrincipal,
  PolicyStatement,
  PolicyDocument,
} from "aws-cdk-lib/aws-iam";
import { LogGroup, CfnSubscriptionFilter } from "aws-cdk-lib/aws-logs";

interface CloudWatchToS3Props {
  readonly logGroup: LogGroup;
  readonly bucket: Bucket;
  readonly filePrefix?: string;
  readonly filterPattern?: string;
}

export class CloudWatchToS3 extends Construct {
  public readonly deliveryStream: CfnDeliveryStream;
  public readonly logBucket: Bucket;

  constructor(scope: Construct, id: string, props: CloudWatchToS3Props) {
    super(scope, id);

    const { logGroup, bucket, filePrefix = "", filterPattern = "" } = props;

    // Create a Firehose role
    const firehoseRole = new Role(this, "FirehoseRole", {
      assumedBy: new ServicePrincipal("firehose.amazonaws.com"),
    });

    firehoseRole.addToPolicy(
      new PolicyStatement({
        actions: ["s3:PutObject", "s3:PutObjectAcl"],
        resources: [`${bucket.bucketArn}/*`],
      }),
    );

    firehoseRole.addToPolicy(
      new PolicyStatement({
        actions: ["logs:PutLogEvents"],
        resources: [
          `arn:aws:logs:${cdk.Stack.of(this).region}:${
            cdk.Stack.of(this).account
          }:log-group:/aws/kinesisfirehose/*`,
        ],
      }),
    );

    // Create a CloudWatch Log Group for Firehose logging
    const firehoseLogGroup = new LogGroup(this, "FirehoseLogGroup", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create a Kinesis Firehose delivery stream
    this.deliveryStream = new CfnDeliveryStream(this, "DeliveryStream", {
      deliveryStreamType: "DirectPut",
      extendedS3DestinationConfiguration: {
        bucketArn: bucket.bucketArn,
        roleArn: firehoseRole.roleArn,
        prefix: filePrefix,
        cloudWatchLoggingOptions: {
          enabled: true,
          logGroupName: firehoseLogGroup.logGroupName,
          logStreamName: `firehose-to-s3-log-stream`,
        },
      },
    });

    const subscriptionFilterRole = new Role(this, "SubscriptionFilterRole", {
      assumedBy: new ServicePrincipal("logs.amazonaws.com"),
      inlinePolicies: {
        PutRecordPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["firehose:PutRecord", "firehose:PutRecordBatch"],
              resources: [
                cdk.Fn.getAtt(this.deliveryStream.logicalId, "Arn").toString(),
              ],
            }),
          ],
        }),
      },
    });

    // Create a subscription filter to send logs from the CloudWatch Log Group to Firehose
    new CfnSubscriptionFilter(this, "SubscriptionFilter", {
      logGroupName: logGroup.logGroupName,
      filterPattern: filterPattern,
      destinationArn: cdk.Fn.getAtt(
        this.deliveryStream.logicalId,
        "Arn",
      ).toString(),
      roleArn: subscriptionFilterRole.roleArn,
    });
  }
}
