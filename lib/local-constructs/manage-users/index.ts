import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import {
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class ManageUsers extends Construct {
  constructor(
    scope: Construct,
    id: string,
    userPool: UserPool,
    users: any,
    passwordSecretArn: string,
  ) {
    super(scope, id);

    const logGroup = new LogGroup(this, `LambdaLogGroup`, {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const manageUsers = new NodejsFunction(this, "LambdaFunction", {
      entry: join(__dirname, "src/manageUsers.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      depsLockFilePath: join(__dirname, "../../../bun.lockb"),
      timeout: Duration.minutes(5),
      logGroup,
      role: new Role(this, "LambdaExecutionRole", {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
        ],
        inlinePolicies: {
          LambdaAssumeRolePolicy: new PolicyDocument({
            statements: [
              new PolicyStatement({
                effect: Effect.DENY,
                actions: ["logs:CreateLogGroup"],
                resources: ["*"],
              }),
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                  "cognito-idp:AdminGetUser",
                  "cognito-idp:AdminCreateUser",
                  "cognito-idp:AdminSetUserPassword",
                  "cognito-idp:AdminUpdateUserAttributes",
                ],
                resources: [userPool.userPoolArn],
              }),
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                  "secretsmanager:GetSecretValue",
                  "secretsmanager:DescribeSecret",
                ],
                resources: ["*"],
              }),
            ],
          }),
        },
      }),
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    const customResourceLogGroup = new LogGroup(
      this,
      `CustomResourceLogGroup`,
      {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    );

    const customResource = new AwsCustomResource(
      this,
      "CleanupKafkaCustomResource",
      {
        onCreate: {
          service: "Lambda",
          action: "invoke",
          parameters: {
            FunctionName: manageUsers.functionName,
            Payload: JSON.stringify({
              RequestType: "Create",
              ResourceProperties: {
                userPoolId: userPool.userPoolId,
                users,
                passwordSecretArn: passwordSecretArn,
              },
            }),
          },
          physicalResourceId: PhysicalResourceId.of("manage-users"),
        },
        onUpdate: {
          service: "Lambda",
          action: "invoke",
          parameters: {
            FunctionName: manageUsers.functionName,
            Payload: JSON.stringify({
              RequestType: "Update",
              ResourceProperties: {
                userPoolId: userPool.userPoolId,
                users,
                passwordSecretArn: passwordSecretArn,
              },
            }),
          },
          physicalResourceId: PhysicalResourceId.of("manage-users"),
        },
        logGroup: customResourceLogGroup,
        policy: AwsCustomResourcePolicy.fromStatements([
          new PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: [manageUsers.functionArn],
          }),
          new PolicyStatement({
            effect: Effect.DENY,
            actions: ["logs:CreateLogGroup"],
            resources: ["*"],
          }),
        ]),
      },
    );
    const policy = customResource.node.findChild("CustomResourcePolicy");
    customResource.node.addDependency(policy);
    customResourceLogGroup.node.addDependency(policy);
  }
}
