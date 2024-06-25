import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_iam as iam, aws_cognito as cognito } from "aws-cdk-lib";
import * as path from "path";
import * as fs from "fs";
import { CfnUserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { ManageUsers } from "./manage-users-construct";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

interface AuthStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  apiGateway: apigateway.RestApi;
  applicationEndpointUrl: string;
}

export class AuthStack extends cdk.NestedStack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.CfnUserPoolClient;
  public readonly userPoolClientDomain: string;
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    resources.userPool;
    this.userPool = resources.userPool;
    this.userPoolClient = resources.userPoolClient;
    this.userPoolClientDomain = `${resources.userPoolDomain.domain}.auth.${this.region}.amazoncognito.com`;
    this.identityPool = resources.identityPool;
  }

  private initializeResources(props: AuthStackProps): {
    userPool: cognito.UserPool;
    userPoolClient: cognito.CfnUserPoolClient;
    userPoolDomain: cognito.CfnUserPoolDomain;
    identityPool: cognito.CfnIdentityPool;
  } {
    const { project, stage, stack, isDev } = props;
    const { apiGateway, applicationEndpointUrl } = props;

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, "CognitoUserPool", {
      userPoolName: `${project}-${stage}-${stack}`,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      selfSignUpEnabled: false, // This corresponds to allowAdminCreateUserOnly: true
      email: cognito.UserPoolEmail.withCognito("no-reply@yourdomain.com"),
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        state: new cognito.StringAttribute({ mutable: true }),
        "cms-roles": new cognito.StringAttribute({ mutable: true }),
      },
    });

    // Cognito User Pool Client
    const userPoolClient = new cognito.CfnUserPoolClient(
      this,
      "CognitoUserPoolClient",
      {
        clientName: `${project}-${stage}-${stack}`,
        userPoolId: userPool.userPoolId,
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
      },
    );

    const userPoolDomain = new CfnUserPoolDomain(this, "UserPoolDomain", {
      domain: `${stage}-login-${userPoolClient.ref}`,
      userPoolId: userPool.userPoolId,
    });

    // Cognito Identity Pool
    const identityPool = new cognito.CfnIdentityPool(
      this,
      "CognitoIdentityPool",
      {
        identityPoolName: `${project}-${stage}-${stack}`,
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.ref,
            providerName: userPool.userPoolProviderName,
          },
        ],
      },
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
        "sts:AssumeRoleWithWebIdentity",
      ),
      inlinePolicies: {
        CognitoAuthorizedPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["execute-api:Invoke"],
              resources: [
                `arn:aws:execute-api:${this.region}:${this.account}:${apiGateway.restApiId}/*`,
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
      },
    );

    const manageUsers = new ManageUsers(
      this,
      userPool,
      project,
      stage,
      stack,
      JSON.parse(
        fs.readFileSync(path.join(__dirname, "other/users.json"), "utf8"),
      ),
    );

    return { userPool, userPoolClient, userPoolDomain, identityPool };
  }
}
