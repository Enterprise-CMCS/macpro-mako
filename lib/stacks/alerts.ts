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

    // Create Alerts Topic with AWS-managed KMS Key
    const alertsTopic = new cdk.aws_sns.Topic(this, "AlertsTopic", {
      topicName: `Alerts-${project}-${stage}`,
      masterKey: cdk.aws_kms.Alias.fromAliasName(this, "KmsAlias", "alias/aws/sns"),
    });

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
