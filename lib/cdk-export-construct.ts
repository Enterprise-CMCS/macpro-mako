import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export class CdkExport extends Construct {
  constructor(
    scope: Construct,
    project: string,
    stage: string,
    stack: string,
    name: string,
    value: any,
  ) {
    super(scope, `CdkExport${name}`);
    new secretsmanager.Secret(this, `CdkExport${name}`, {
      secretName: `cdkExports/${project}-${stage}-${stack}/${name}`,
      secretStringValue: cdk.SecretValue.unsafePlainText(
        value === "string" ? value : JSON.stringify(value),
      ),
    });
  }
}
