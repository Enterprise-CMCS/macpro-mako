import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_iam as iam, aws_cognito as cognito } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as fs from "fs";
import * as cr from "aws-cdk-lib/custom-resources";
import { CfnUserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { cdkExport, cdkImport } from "./utils/cdk-export";

interface AuthStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
}

export class AuthStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);
    this.initializeResources(props);
  }

  private initializeResources(props: AuthStackProps) {
    const { project, stage } = props;
    const apiId = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `api`,
      "apiGatewayRestApiId"
    ).getAttString("Value");

    const applicationEndpointUrl = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `ui-infra`,
      "applicationEndpointUrl"
    ).getAttString("Value");

    // Cognito User Pool
    const userPool = new cognito.CfnUserPool(this, "CognitoUserPool", {
      adminCreateUserConfig: {
        allowAdminCreateUserOnly: true,
      },
      userPoolName: this.node.id,
      usernameAttributes: ["email"],
      autoVerifiedAttributes: ["email"],
      emailConfiguration: {
        emailSendingAccount: "COGNITO_DEFAULT",
      },
      schema: [
        {
          name: "given_name",
          attributeDataType: "String",
          mutable: true,
          required: true,
        },
        {
          name: "family_name",
          attributeDataType: "String",
          mutable: true,
          required: true,
        },
        {
          name: "state",
          attributeDataType: "String",
          mutable: true,
          required: false,
        },
        {
          name: "cms-roles",
          attributeDataType: "String",
          mutable: true,
          required: false,
        },
        {
          name: "username",
          attributeDataType: "String",
          mutable: true,
          required: false,
        },
      ],
    });

    // Cognito User Pool Client
    const userPoolClient = new cognito.CfnUserPoolClient(
      this,
      "CognitoUserPoolClient",
      {
        clientName: this.node.id,
        userPoolId: userPool.attrUserPoolId,
        explicitAuthFlows: ["ADMIN_NO_SRP_AUTH"],
        generateSecret: false,
        allowedOAuthFlows: ["code"],
        allowedOAuthFlowsUserPoolClient: true,
        allowedOAuthScopes: [
          "email",
          "openid",
          "aws.cognito.signin.user.admin",
        ],
        callbackUrLs: [applicationEndpointUrl, "http://localhost:5000/"],
        defaultRedirectUri: applicationEndpointUrl,
        logoutUrLs: [applicationEndpointUrl, "http://localhost:5000/"],
        supportedIdentityProviders: ["COGNITO"],
        accessTokenValidity: 30,
        idTokenValidity: 30,
        refreshTokenValidity: 12,
        tokenValidityUnits: {
          accessToken: "minutes",
          idToken: "minutes",
          refreshToken: "hours",
        },
      }
    );

    const userPoolDomain = new CfnUserPoolDomain(this, "UserPoolDomain", {
      domain: `${stage}-login-${userPoolClient.ref}`,
      userPoolId: userPool.attrUserPoolId,
    });

    // Cognito Identity Pool
    const identityPool = new cognito.CfnIdentityPool(
      this,
      "CognitoIdentityPool",
      {
        identityPoolName: this.node.id,
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.ref,
            providerName: userPool.attrProviderName,
          },
        ],
      }
    );

    // IAM Role for Cognito Authenticated Users
    const authRole = new iam.Role(this, "CognitoAuthRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      inlinePolicies: {
        CognitoAuthorizedPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["execute-api:Invoke"],
              resources: [
                `arn:aws:execute-api:${this.region}:${this.account}:${apiId}/*`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "CognitoIdentityPoolRoles",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: authRole.roleArn },
      }
    );

    const manageUsers = new NodejsFunction(this, "ManageUsersLambdaFunction", {
      functionName: `${this.node.id}-manageUsers`,
      entry: path.join(__dirname, "lambda/manageUsers.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(1),
      role: new iam.Role(this, "ManageUsersLambdaExecutionRole", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
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
                resources: [userPool.attrArn],
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
      }
    );

    new cdk.CustomResource(this, "ManageUsers", {
      serviceToken: manageUsersCustomResourceProvider.serviceToken,
      properties: {
        userPoolId: userPool.attrUserPoolId,
        users: JSON.parse(
          fs.readFileSync(path.join(__dirname, "other/users.json"), "utf8")
        ),
        project,
        stage,
      },
    });

    cdkExport(this, this.node.id, "userPoolId", userPool.attrUserPoolId);
    cdkExport(
      this,
      this.node.id,
      "userPoolClientId",
      userPoolClient.attrClientId
    );
    cdkExport(
      this,
      this.node.id,
      "userPoolClientDomain",
      `${userPoolDomain.domain}.auth.${this.region}.amazoncognito.com`
    );
    cdkExport(this, this.node.id, "identityPoolId", identityPool.ref);
  }
}
