import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { DeploymentConfigProperties } from "./deployment-config";
import { ManageUsers } from "local-constructs";

interface AuthStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpc: cdk.aws_ec2.IVpc;
  privateSubnets: cdk.aws_ec2.ISubnet[];
  lambdaSecurityGroup: cdk.aws_ec2.ISecurityGroup;
  apiGateway: cdk.aws_apigateway.RestApi;
  applicationEndpointUrl: string;
  idmEnable: DeploymentConfigProperties["idmEnable"];
  idmClientSecretArn: DeploymentConfigProperties["idmClientSecretArn"];
  idmClientId: DeploymentConfigProperties["idmClientId"];
  idmClientIssuer: DeploymentConfigProperties["idmClientIssuer"];
  idmAuthzApiEndpoint: DeploymentConfigProperties["idmAuthzApiEndpoint"];
  idmAuthzApiKeyArn: DeploymentConfigProperties["idmAuthzApiKeyArn"];
  devPasswordArn: DeploymentConfigProperties["devPasswordArn"];
}

export class Auth extends cdk.NestedStack {
  public readonly userPool: cdk.aws_cognito.UserPool;
  public readonly userPoolClient: cdk.aws_cognito.CfnUserPoolClient;
  public readonly userPoolClientDomain: string;
  public readonly identityPool: cdk.aws_cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.userPool = resources.userPool;
    this.userPoolClient = resources.userPoolClient;
    this.userPoolClientDomain = `${resources.userPoolDomain.domain}.auth.${this.region}.amazoncognito.com`;
    this.identityPool = resources.identityPool;
  }

  private initializeResources(props: AuthStackProps): {
    userPool: cdk.aws_cognito.UserPool;
    userPoolClient: cdk.aws_cognito.CfnUserPoolClient;
    userPoolDomain: cdk.aws_cognito.CfnUserPoolDomain;
    identityPool: cdk.aws_cognito.CfnIdentityPool;
  } {
    const { project, stage, stack } = props;
    const {
      apiGateway,
      applicationEndpointUrl,
      vpc,
      privateSubnets,
      lambdaSecurityGroup,
      idmEnable,
      idmClientId,
      idmClientIssuer,
      idmAuthzApiEndpoint,
      devPasswordArn,
      idmClientSecretArn,
      idmAuthzApiKeyArn,
    } = props;
    const idmClientSecret = cdk.aws_secretsmanager.Secret.fromSecretCompleteArn(
      this,
      "IdmInfo",
      idmClientSecretArn,
    );

    // Cognito User Pool
    const userPool = new cdk.aws_cognito.UserPool(this, "CognitoUserPool", {
      userPoolName: `${project}-${stage}-${stack}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      selfSignUpEnabled: false, // This corresponds to allowAdminCreateUserOnly: true
      email: cdk.aws_cognito.UserPoolEmail.withCognito(
        "no-reply@yourdomain.com",
      ),
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
        state: new cdk.aws_cognito.StringAttribute({ mutable: true }),
        "cms-roles": new cdk.aws_cognito.StringAttribute({ mutable: true }),
        "username": new cdk.aws_cognito.StringAttribute({ mutable: true }),
      },
    });
    let userPoolIdentityProviderOidc:
      | cdk.aws_cognito.UserPoolIdentityProviderOidc
      | undefined = undefined;
    if (idmEnable) {
      userPoolIdentityProviderOidc =
        new cdk.aws_cognito.UserPoolIdentityProviderOidc(
          this,
          "UserPoolIdentityProviderIDM",
          {
            userPool,
            name: "IDM",
            clientId: idmClientId,
            clientSecret: idmClientSecret.secretValue.unsafeUnwrap(),
            issuerUrl: idmClientIssuer,
            attributeMapping: {
              email: cdk.aws_cognito.ProviderAttribute.other("email"),
              givenName: cdk.aws_cognito.ProviderAttribute.other("given_name"),
              familyName:
                cdk.aws_cognito.ProviderAttribute.other("family_name"),
              custom: {
                "custom:username":
                  cdk.aws_cognito.ProviderAttribute.other("preferred_username"),
              },
            },
            attributeRequestMethod:
              cdk.aws_cognito.OidcAttributeRequestMethod.GET,
            scopes: ["email", "openid", "profile", "phone"],
            identifiers: ["IDM"],
          },
        );
    }

    // Cognito User Pool Client
    const userPoolClient = new cdk.aws_cognito.CfnUserPoolClient(
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
        supportedIdentityProviders: userPoolIdentityProviderOidc
          ? ["COGNITO", userPoolIdentityProviderOidc.providerName]
          : ["COGNITO"],
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

    const userPoolDomain = new cdk.aws_cognito.CfnUserPoolDomain(
      this,
      "UserPoolDomain",
      {
        domain: `${stage}-login-${userPoolClient.ref}`,
        userPoolId: userPool.userPoolId,
      },
    );

    // Cognito Identity Pool
    const identityPool = new cdk.aws_cognito.CfnIdentityPool(
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
    const authRole = new cdk.aws_iam.Role(this, "CognitoAuthRole", {
      assumedBy: new cdk.aws_iam.FederatedPrincipal(
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
        CognitoAuthorizedPolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              actions: ["execute-api:Invoke"],
              resources: [
                `arn:aws:execute-api:${this.region}:${this.account}:${apiGateway.restApiId}/*`,
              ],
              effect: cdk.aws_iam.Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    new cdk.aws_cognito.CfnIdentityPoolRoleAttachment(
      this,
      "CognitoIdentityPoolRoles",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: authRole.roleArn },
      },
    );

    new ManageUsers(
      this,
      "ManageUsers",
      userPool,
      JSON.parse(
        readFileSync(
          join(__dirname, "../../test/users/app-users.json"),
          "utf8",
        ),
      ),
      devPasswordArn,
    );

    if (idmEnable) {
      const postAuthLambdaLogGroup = new cdk.aws_logs.LogGroup(
        this,
        "PostAuthLambdaLogGroup",
        {
          logGroupName: `/aws/lambda/${project}-${stage}-${stack}-postAuth`,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        },
      );

      const postAuthLambdaRole = new cdk.aws_iam.Role(
        this,
        "PostAuthLambdaRole",
        {
          assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
          managedPolicies: [
            cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole",
            ),
            cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaVPCAccessExecutionRole",
            ),
          ],
          inlinePolicies: {
            DataStackLambdarole: new cdk.aws_iam.PolicyDocument({
              statements: [
                new cdk.aws_iam.PolicyStatement({
                  effect: cdk.aws_iam.Effect.ALLOW,
                  actions: [
                    "cognito-idp:AdminGetUser",
                    "cognito-idp:AdminCreateUser",
                    "cognito-idp:AdminSetUserPassword",
                    "cognito-idp:AdminUpdateUserAttributes",
                  ],
                  resources: [
                    `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/us-east-*`,
                  ],
                }),
                new cdk.aws_iam.PolicyStatement({
                  effect: cdk.aws_iam.Effect.ALLOW,
                  actions: [
                    "secretsmanager:DescribeSecret",
                    "secretsmanager:GetSecretValue",
                  ],
                  resources: [idmAuthzApiKeyArn],
                }),
              ],
            }),
          },
        },
      );
      const postAuthLambda = new NodejsFunction(this, "PostAuthLambda", {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        entry: join(__dirname, "../lambda/postAuth.ts"),
        handler: "handler",
        role: postAuthLambdaRole,
        depsLockFilePath: join(__dirname, "../../bun.lockb"),
        environment: {
          idmAuthzApiEndpoint,
          idmAuthzApiKeyArn,
        },
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
        retryAttempts: 0,
        vpc: vpc,
        securityGroups: [lambdaSecurityGroup],
        vpcSubnets: { subnets: privateSubnets },
        logGroup: postAuthLambdaLogGroup,
        bundling: {
          minify: true,
          sourceMap: true,
        },
      });

      userPool.addTrigger(
        cdk.aws_cognito.UserPoolOperation.PRE_TOKEN_GENERATION,
        postAuthLambda,
      );
    }

    return { userPool, userPoolClient, userPoolDomain, identityPool };
  }
}
