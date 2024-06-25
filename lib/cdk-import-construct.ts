import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cr from "aws-cdk-lib/custom-resources";

export class CdkImport extends Construct {
  public readonly value: string;
  constructor(
    scope: Construct,
    project: string,
    stage: string,
    stack: string,
    name: string,
  ) {
    super(scope, `CdkImport${name}`);
    const secretName = `cdkExports/${project}-${stage}-${stack}/${name}`;
    const customResourcePolicy = cr.AwsCustomResourcePolicy.fromStatements([
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          `arn:aws:secretsmanager:${cdk.Stack.of(this).region}:${
            cdk.Stack.of(this).account
          }:secret:${secretName}*`,
        ],
      }),
    ]);

    const getSecretValue = new cr.AwsCustomResource(
      this,
      `GetSecretValue${name.replace(/[^a-zA-Z0-9]/g, "")}`,
      {
        onCreate: {
          // Called during stack creation
          service: "SecretsManager",
          action: "getSecretValue",
          parameters: {
            SecretId: secretName,
          },
          physicalResourceId: cr.PhysicalResourceId.of(secretName),
        },
        policy: customResourcePolicy,
      },
    );
    this.value = getSecretValue.getResponseField("SecretString");
  }
}
