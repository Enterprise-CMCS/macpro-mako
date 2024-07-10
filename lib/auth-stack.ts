import { readFileSync } from "fs";
import { join } from "path";

import {
  Duration,
  NestedStack,
  NestedStackProps,
  RemovalPolicy,
} from "aws-cdk-lib";
import { IVpc, ISubnet, ISecurityGroup } from "aws-cdk-lib/aws-ec2";
import {
  Effect,
  FederatedPrincipal,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import {
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  CfnUserPoolClient,
  CfnUserPoolDomain,
  StringAttribute,
  UserPool,
  UserPoolEmail,
  UserPoolIdentityProviderOidc,
  UserPoolOperation,
  OidcAttributeRequestMethod,
  ProviderAttribute,
} from "aws-cdk-lib/aws-cognito";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

import { DeploymentConfigProperties } from "./deployment-config";
import { ManageUsers } from "local-constructs";

interface AuthStackProps extends NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpc: IVpc;
  privateSubnets: ISubnet[];
  lambdaSecurityGroup: ISecurityGroup;
  apiGateway: RestApi;
  applicationEndpointUrl: string;
  idmEnable: DeploymentConfigProperties["idmEnable"];
  idmClientSecretArn: DeploymentConfigProperties["idmClientSecretArn"];
  idmClientId: DeploymentConfigProperties["idmClientId"];
  idmClientIssuer: DeploymentConfigProperties["idmClientIssuer"];
  idmAuthzApiEndpoint: DeploymentConfigProperties["idmAuthzApiEndpoint"];
  idmAuthzApiKeyArn: DeploymentConfigProperties["idmAuthzApiKeyArn"];
  devPasswordArn: DeploymentConfigProperties["devPasswordArn"];
}

export class AuthStack extends NestedStack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: CfnUserPoolClient;
  public readonly userPoolClientDomain: string;
  public readonly identityPool: CfnIdentityPool;

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
    userPool: UserPool;
    userPoolClient: CfnUserPoolClient;
    userPoolDomain: CfnUserPoolDomain;
    identityPool: CfnIdentityPool;
  } {
    const { project, stage, stack, isDev } = props;
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
    const idmClientSecret = Secret.fromSecretCompleteArn(
      this,
      "IdmInfo",
      idmClientSecretArn,
    );

    // Cognito User Pool
    const userPool = new UserPool(this, "CognitoUserPool", {
      userPoolName: `${project}-${stage}-${stack}`,
      removalPolicy: RemovalPolicy.DESTROY,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      selfSignUpEnabled: false, // This corresponds to allowAdminCreateUserOnly: true
      email: UserPoolEmail.withCognito("no-reply@yourdomain.com"),
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
        state: new StringAttribute({ mutable: true }),
        "cms-roles": new StringAttribute({ mutable: true }),
      },
    });
    let userPoolIdentityProviderOidc: UserPoolIdentityProviderOidc | undefined =
      undefined;
    if (idmEnable) {
      userPoolIdentityProviderOidc = new UserPoolIdentityProviderOidc(
        this,
        "UserPoolIdentityProviderIDM",
        {
          userPool,
          name: "IDM",
          clientId: idmClientId,
          clientSecret: idmClientSecret.secretValue.unsafeUnwrap(),
          issuerUrl: idmClientIssuer,
          attributeMapping: {
            email: ProviderAttribute.other("email"),
            givenName: ProviderAttribute.other("given_name"),
            familyName: ProviderAttribute.other("family_name"),
            custom: {
              "custom:username": ProviderAttribute.other("preferred_username"),
            },
          },
          attributeRequestMethod: OidcAttributeRequestMethod.GET,
          scopes: ["email", "openid", "profile", "phone"],
          identifiers: ["IDM"],
        },
      );
    }

    // Cognito User Pool Client
    const userPoolClient = new CfnUserPoolClient(
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

    const userPoolDomain = new CfnUserPoolDomain(this, "UserPoolDomain", {
      domain: `${stage}-login-${userPoolClient.ref}`,
      userPoolId: userPool.userPoolId,
    });

    // Cognito Identity Pool
    const identityPool = new CfnIdentityPool(this, "CognitoIdentityPool", {
      identityPoolName: `${project}-${stage}-${stack}`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.ref,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    // IAM Role for Cognito Authenticated Users
    const authRole = new Role(this, "CognitoAuthRole", {
      assumedBy: new FederatedPrincipal(
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
        CognitoAuthorizedPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["execute-api:Invoke"],
              resources: [
                `arn:aws:execute-api:${this.region}:${this.account}:${apiGateway.restApiId}/*`,
              ],
              effect: Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    new CfnIdentityPoolRoleAttachment(this, "CognitoIdentityPoolRoles", {
      identityPoolId: identityPool.ref,
      roles: { authenticated: authRole.roleArn },
    });

    const manageUsers = new ManageUsers(
      this,
      "ManageUsers",
      userPool,
      JSON.parse(
        readFileSync(join(__dirname, "../test/users/app-users.json"), "utf8"),
      ),
      devPasswordArn,
    );

    if (idmEnable) {
      const postAuthLambdaLogGroup = new LogGroup(
        this,
        "PostAuthLambdaLogGroup",
        {
          logGroupName: `/aws/lambda/${project}-${stage}-${stack}-postAuth`,
          removalPolicy: RemovalPolicy.DESTROY,
        },
      );

      const postAuthLambdaRole = new Role(this, "PostAuthLambdaRole", {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
        ],
        inlinePolicies: {
          DataStackLambdarole: new PolicyDocument({
            statements: [
              new PolicyStatement({
                effect: Effect.ALLOW,
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
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                  "secretsmanager:DescribeSecret",
                  "secretsmanager:GetSecretValue",
                ],
                resources: [idmAuthzApiKeyArn],
              }),
            ],
          }),
        },
      });
      const postAuthLambda = new NodejsFunction(this, "PostAuthLambda", {
        runtime: Runtime.NODEJS_18_X,
        entry: join(__dirname, "lambda/postAuth.ts"),
        handler: "handler",
        role: postAuthLambdaRole,
        environment: {
          idmAuthzApiEndpoint,
          idmAuthzApiKeyArn,
        },
        timeout: Duration.seconds(30),
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
        UserPoolOperation.PRE_TOKEN_GENERATION,
        postAuthLambda,
      );
    }

    return { userPool, userPoolClient, userPoolDomain, identityPool };
  }
}
