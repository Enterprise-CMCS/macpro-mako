import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cr from "aws-cdk-lib/custom-resources";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class ManageUsers extends Construct {
  constructor(
    scope: Construct,
    userPool: cognito.UserPool,
    project: string,
    stage: string,
    stack: string,
    users: any,
  ) {
    super(scope, `ManageUsers`);

    const manageUsers = new NodejsFunction(this, "ManageUsersLambdaFunction", {
      functionName: `${project}-${stage}-${stack}-manageUsers`,
      entry: path.join(__dirname, "lambda/manageUsers.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      role: new iam.Role(this, "ManageUsersLambdaExecutionRole", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
        ],
        inlinePolicies: {
          LambdaAssumeRolePolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  "cognito-idp:AdminGetUser",
                  "cognito-idp:AdminCreateUser",
                  "cognito-idp:AdminSetUserPassword",
                  "cognito-idp:AdminUpdateUserAttributes",
                ],
                resources: [userPool.userPoolArn],
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ["secretsmanager:GetSecretValue"],
                resources: ["*"],
              }),
            ],
          }),
        },
      }),
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
        externalModules: ["aws-sdk"],
      },
    });

    const manageUsersCustomResourceProvider = new cr.Provider(
      this,
      "ManageUsersCustomResourceProvider",
      {
        onEventHandler: manageUsers,
      },
    );

    new cdk.CustomResource(this, "ManageUsers", {
      serviceToken: manageUsersCustomResourceProvider.serviceToken,
      properties: {
        userPoolId: userPool.userPoolId,
        users,
        project,
        stage,
      },
    });
  }
}
