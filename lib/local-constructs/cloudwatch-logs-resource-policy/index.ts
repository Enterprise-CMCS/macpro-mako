import { Construct } from "constructs";
import { CfnResourcePolicy } from "aws-cdk-lib/aws-logs";
import { Stack } from "aws-cdk-lib";

interface CloudWatchLogsResourcePolicyProps {
  readonly project: string;
}

export class CloudWatchLogsResourcePolicy extends Construct {
  public readonly policy: CfnResourcePolicy;

  constructor(
    scope: Construct,
    id: string,
    props: CloudWatchLogsResourcePolicyProps,
  ) {
    super(scope, id);
    const stack = Stack.of(this);
    this.policy = new CfnResourcePolicy(
      this,
      `CentralizedCloudWatchLogsResourcePolicy`,
      {
        policyName: `${props.project}-centralized-logs-policy-${id}`,
        policyDocument: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { Service: "delivery.logs.amazonaws.com" },
              Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
              Resource: [
                `arn:aws:logs:*:${stack.account}:log-group:aws-waf-logs-*`,
                `arn:aws:logs:*:${stack.account}:log-group:/aws/http-api/*`,
                `arn:aws:logs:*:${stack.account}:log-group:/aws/vendedlogs/*`,
              ],
              Condition: {
                StringEquals: { "aws:SourceAccount": stack.account },
                ArnLike: {
                  "aws:SourceArn": `arn:aws:logs:${stack.region}:${stack.account}:*`,
                },
              },
            },
          ],
        }),
      },
    );
  }
}
