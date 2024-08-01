import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface AlertsStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
}

export class Alerts extends cdk.NestedStack {
  public readonly topic: cdk.aws_sns.Topic;

  constructor(scope: Construct, id: string, props: AlertsStackProps) {
    super(scope, id, props);
    this.topic = this.initializeResources(props);
  }

  private initializeResources(props: AlertsStackProps): cdk.aws_sns.Topic {
    const { project, stage } = props;

    // Create Alerts Topic with KMS Key
    const alertsTopic = new cdk.aws_sns.Topic(this, "AlertsTopic", {
      topicName: `Alerts-${project}-${stage}`,
    });

    const kmsKeyForSns = new cdk.aws_kms.Key(this, "KmsKeyForSns", {
      enableKeyRotation: true,
    });

    // KMS Key Policy
    kmsKeyForSns.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: "Allow access for Root User",
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [new cdk.aws_iam.AccountPrincipal(cdk.Aws.ACCOUNT_ID)],
        actions: ["kms:*"],
        resources: ["*"],
      }),
    );
    kmsKeyForSns.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: "Allow access for Key User (SNS Service Principal)",
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [new cdk.aws_iam.ServicePrincipal("sns.amazonaws.com")],
        actions: ["kms:GenerateDataKey", "kms:Decrypt"],
        resources: ["*"],
      }),
    );
    kmsKeyForSns.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: "Allow CloudWatch events to use the key",
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [
          new cdk.aws_iam.ServicePrincipal("events.amazonaws.com"),
          new cdk.aws_iam.ServicePrincipal("cloudwatch.amazonaws.com"),
        ],
        actions: ["kms:Decrypt", "kms:GenerateDataKey"],
        resources: ["*"],
      }),
    );

    // Output the Alerts Topic ARN
    new cdk.CfnOutput(this, "AlertsTopicArn", {
      description: "Alerts Topic ARN",
      value: alertsTopic.topicArn,
    });

    // EventBridge to SNS Topic Policy
    new cdk.aws_sns.CfnTopicPolicy(this, "EventBridgeToToSnsPolicy", {
      topics: [alertsTopic.topicArn],
      policyDocument: {
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: ["events.amazonaws.com", "cloudwatch.amazonaws.com"],
            },
            Action: "sns:Publish",
            Resource: alertsTopic.topicArn,
          },
        ],
      },
    });

    return alertsTopic;
  }
}
