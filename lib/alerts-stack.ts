import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  PolicyStatement,
  Effect,
  AccountPrincipal,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { CfnTopicPolicy, Topic } from "aws-cdk-lib/aws-sns";
import { Key } from "aws-cdk-lib/aws-kms";
import { CdkExport } from "./cdk-export-construct";

export class AlertsStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);
    this.initializeResources();
  }
  private async initializeResources() {
    const parentName = this.node.id;
    const stackName = this.nestedStackResource!.logicalId;
    try {
      // Create Alerts Topic with KMS Key
      const alertsTopic = new Topic(this, "AlertsTopic", {
        topicName: `Alerts-${this.node.id}`,
      });

      const kmsKeyForSns = new Key(this, "KmsKeyForSns", {
        enableKeyRotation: true,
      });

      // KMS Key Policy
      kmsKeyForSns.addToResourcePolicy(
        new PolicyStatement({
          sid: "Allow access for Root User",
          effect: Effect.ALLOW,
          principals: [new AccountPrincipal(cdk.Aws.ACCOUNT_ID)],
          actions: ["kms:*"],
          resources: ["*"],
        }),
      );
      kmsKeyForSns.addToResourcePolicy(
        new PolicyStatement({
          sid: "Allow access for Key User (SNS Service Principal)",
          effect: Effect.ALLOW,
          principals: [new ServicePrincipal("sns.amazonaws.com")],
          actions: ["kms:GenerateDataKey", "kms:Decrypt"],
          resources: ["*"],
        }),
      );
      kmsKeyForSns.addToResourcePolicy(
        new PolicyStatement({
          sid: "Allow CloudWatch events to use the key",
          effect: Effect.ALLOW,
          principals: [
            new ServicePrincipal("events.amazonaws.com"),
            new ServicePrincipal("cloudwatch.amazonaws.com"),
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
      new CfnTopicPolicy(this, "EventBridgeToToSnsPolicy", {
        topics: [alertsTopic.topicArn], // Provide the topic ARN
        policyDocument: {
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: ["events.amazonaws.com", "cloudwatch.amazonaws.com"],
              },
              Action: "sns:Publish",
              Resource: alertsTopic.topicArn, // Use the topic ARN
            },
          ],
        },
      });

      new CdkExport(
        this,
        parentName,
        stackName,
        "ecsFailureTopicArn",
        alertsTopic.topicArn,
      );
    } catch (error) {
      console.error("Error initializing resources:", error);
      process.exit(1);
    }
  }
}
