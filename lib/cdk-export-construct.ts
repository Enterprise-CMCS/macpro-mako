import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export class CdkExport extends Construct {
  constructor(
    scope: Construct,
    parentName: string,
    stackName: string,
    name: string,
    value: any,
  ) {
    super(scope, `CdkExport${name}`);
    new secretsmanager.Secret(this, `CdkExport${name}`, {
      secretName: `cdkExports/${parentName}-${stackName}/${name}`,
      secretStringValue: cdk.SecretValue.unsafePlainText(
        value === "string" ? value : JSON.stringify(value),
      ),
    });
  }
}
