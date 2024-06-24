import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cr from "aws-cdk-lib/custom-resources";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Duration } from "aws-cdk-lib";

export function cdkExport(
  scope: Construct,
  stackName: string,
  name: string,
  value: any
) {
  // Convert the value to a string without wrapping in double quotes
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);

  return new secretsmanager.Secret(scope, `CdkExport${name}`, {
    secretName: `cdkExports/${stackName}/${name}`, // Optional: specify a name for the secret
    secretStringValue: cdk.SecretValue.unsafePlainText(stringValue),
  });
}

export function cdkImport(
  scope: Construct,
  stackName: string,
  project: string,
  stage: string,
  stack: string,
  name: string
) {
  const secretName = `cdkExports/${project}-${stack}-${stage}/${name}`;

  const logGroup = new logs.LogGroup(
    scope,
    `FetchExportLogGroup${stack}${name}`,
    {
      logGroupName: `/aws/lambda/${stackName}-fetchExport-${stack}-${name}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Optional: define the log group removal policy
    }
  );

  // Define the IAM role with permission to get secrets
  const lambdaRole = new iam.Role(scope, `CdkImportLambdaRole${stack}${name}`, {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
  });

  lambdaRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: ["*"], // Optionally, you can scope this to specific secrets
    })
  );

  const cdkImportLambda = new NodejsFunction(
    scope,
    `CdkImportLambda${stack}${name}`,
    {
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: Duration.seconds(60),
      handler: "handler",
      entry: path.join(__dirname, "../lambda/fetchExport.ts"),
      logGroup,
      role: lambdaRole,
    }
  );

  logGroup.grantWrite(cdkImportLambda);

  const cdkImportProvider = new cr.Provider(
    scope,
    `CdkImportProvider${stack}${name}`,
    {
      onEventHandler: cdkImportLambda,
    }
  );

  const cdkImportCustomResource = new cdk.CustomResource(
    scope,
    `CdkImportCustomResource${stack}${name}`,
    {
      serviceToken: cdkImportProvider.serviceToken,
      properties: {
        SecretName: secretName,
      },
    }
  );

  return cdkImportCustomResource;
}
