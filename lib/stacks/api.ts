import * as cdk from "aws-cdk-lib";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as LC from "local-constructs";
import { join } from "path";

import { commonBundlingOptions } from "../config/bundling-config";
import { DeploymentConfigProperties } from "../config/deployment-config";

interface ApiStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpc: cdk.aws_ec2.IVpc;
  privateSubnets: cdk.aws_ec2.ISubnet[];
  lambdaSecurityGroup: cdk.aws_ec2.ISecurityGroup;
  topicNamespace: string;
  indexNamespace: string;
  openSearchDomainArn: string;
  openSearchDomainEndpoint: string;
  alertsTopic: cdk.aws_sns.Topic;
  attachmentsBucket: cdk.aws_s3.Bucket;
  brokerString: DeploymentConfigProperties["brokerString"];
  dbInfoSecretName: DeploymentConfigProperties["dbInfoSecretName"];
  legacyS3AccessRoleArn: DeploymentConfigProperties["legacyS3AccessRoleArn"];
  notificationSecretName: DeploymentConfigProperties["notificationSecretName"];
  notificationSecretArn: DeploymentConfigProperties["notificationSecretArn"];
}

export class Api extends cdk.NestedStack {
  public readonly apiGateway: cdk.aws_apigateway.RestApi;
  public readonly apiGatewayUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.apiGateway = resources.apiGateway;
    this.apiGatewayUrl = `https://${this.apiGateway.restApiId}.execute-api.${this.region}.amazonaws.com/${props.stage}`;
  }

  private initializeResources(props: ApiStackProps): {
    apiGateway: cdk.aws_apigateway.RestApi;
  } {
    const { project, stage, isDev, stack } = props;
    const {
      vpc,
      privateSubnets,
      brokerString,
      legacyS3AccessRoleArn,
      lambdaSecurityGroup,
      topicNamespace,
      indexNamespace,
      openSearchDomainArn,
      openSearchDomainEndpoint,
      alertsTopic,
      attachmentsBucket,
      dbInfoSecretName,
      notificationSecretName,
      notificationSecretArn,
    } = props;

    const topicName = `${topicNamespace}aws.onemac.migration.cdc`;
    const smartTopicName = `${topicNamespace}aws.smart.inbound.events`;

    // ==========================================
    // DataSink Infrastructure - DynamoDB Idempotency Table
    // ==========================================
    const idempotencyTable = new cdk.aws_dynamodb.Table(this, "DataSinkIdempotency", {
      tableName: `${project}-${stage}-dataSinkIdempotency`,
      partitionKey: {
        name: "eventId",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "expiresAt",
      removalPolicy: isDev ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: !isDev,
      },
    });

    // ==========================================
    // DataSink Infrastructure - API Key Secret
    // ==========================================
    const dataSinkApiKeySecret = new cdk.aws_secretsmanager.Secret(this, "DataSinkApiKeySecret", {
      secretName: `${project}/${stage}/dataSink-api-key`, // pragma: allowlist secret
      description: "API Key for dataSink endpoint (SMART/MuleSoft integration)",
      generateSecretString: {
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    // Note: Cross-account access policy can be added here when MuleSoft account ID is known
    // dataSinkApiKeySecret.addToResourcePolicy(new cdk.aws_iam.PolicyStatement({
    //   effect: cdk.aws_iam.Effect.ALLOW,
    //   principals: [new cdk.aws_iam.AccountPrincipal("MULESOFT_ACCOUNT_ID")],
    //   actions: ["secretsmanager:GetSecretValue"],
    //   resources: ["*"],
    // }));

    // Define IAM role
    const lambdaRole = new cdk.aws_iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
      ],
      inlinePolicies: {
        LambdaPolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "es:ESHttpHead",
                "es:ESHttpPost",
                "es:ESHttpGet",
                "es:ESHttpPatch",
                "es:ESHttpDelete",
                "es:ESHttpPut",
              ],
              resources: [`${openSearchDomainArn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["cognito-idp:GetUser", "cognito-idp:ListUsers"],
              resources: ["*"],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [legacyS3AccessRoleArn],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "s3:PutObject",
                "s3:PutObjectTagging",
                "s3:GetObject",
                "s3:GetObjectTagging",
              ],
              resources: [`${attachmentsBucket.bucketArn}/*`],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
              resources: [
                `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${dbInfoSecretName}-*`,
              ],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["secretsmanager:DescribeSecret", "secretsmanager:GetSecretValue"],
              resources: [
                `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${notificationSecretName}-*`,
              ],
            }),
          ],
        }),
      },
    });

    // Define Lambda functions
    const createNodeJsLambda = (
      id: string,
      entry: string,
      environment: { [key: string]: string | undefined },
      vpc?: cdk.aws_ec2.IVpc,
      securityGroup?: cdk.aws_ec2.ISecurityGroup,
      subnets?: cdk.aws_ec2.ISubnet[],
      provisionedConcurrency: number = 0,
    ) => {
      // Remove any undefined values from the environment object
      const sanitizedEnvironment: { [key: string]: string } = {};
      for (const key in environment) {
        if (environment[key] !== undefined) {
          sanitizedEnvironment[key] = environment[key] as string;
        }
      }

      const logGroup = new cdk.aws_logs.LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-${id}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      const fn = new NodejsFunction(this, id, {
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        functionName: `${project}-${stage}-${stack}-${id}`,
        depsLockFilePath: join(__dirname, "../../bun.lockb"),
        entry,
        handler: "handler",
        role: lambdaRole,
        environment: sanitizedEnvironment,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
        retryAttempts: 0,
        vpc: vpc,
        securityGroups: securityGroup ? [securityGroup] : undefined,
        vpcSubnets: subnets ? { subnets } : undefined,
        logGroup,
        bundling: commonBundlingOptions,
      });

      if (provisionedConcurrency > 0) {
        const version = fn.currentVersion;

        // Configure provisioned concurrency
        new cdk.aws_lambda.Alias(this, `FunctionAlias${id}`, {
          aliasName: "prod",
          version: version,
          provisionedConcurrentExecutions: provisionedConcurrency,
        });
      }
      return fn;
    };

    const lambdaDefinitions = [
      {
        id: "getUploadUrl",
        entry: join(__dirname, "../lambda/getUploadUrl.ts"),
        environment: {
          attachmentsBucketName: attachmentsBucket.bucketName,
          attachmentsBucketRegion: this.region,
        },
      },
      {
        id: "search",
        entry: join(__dirname, "../lambda/search.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 4,
      },
      {
        id: "getPackageActions",
        entry: join(__dirname, "../lambda/getPackageActions.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          legacyS3AccessRoleArn,
          indexNamespace,
        },
      },
      {
        id: "getAttachmentUrl",
        entry: join(__dirname, "../lambda/getAttachmentUrl.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          legacyS3AccessRoleArn,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "item",
        entry: join(__dirname, "../lambda/item.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submit",
        entry: join(__dirname, "../lambda/submit/index.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getUserDetails",
        entry: join(__dirname, "../lambda/user-management/getUserDetails.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "requestBaseCMSAccess",
        entry: join(__dirname, "../lambda/user-management/requestBaseCMSAccess.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "createUserProfile",
        entry: join(__dirname, "../lambda/user-management/createUserProfile.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getUserProfile",
        entry: join(__dirname, "../lambda/user-management/getUserProfile.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submitGroupDivision",
        entry: join(__dirname, "../lambda/user-management/submitGroupDivision.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "updateUserRoles",
        entry: join(__dirname, "../lambda/user-management/updateUserRoles.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getRoleRequests",
        entry: join(__dirname, "../lambda/user-management/getRoleRequests.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getApprovers",
        entry: join(__dirname, "../lambda/user-management/getApprovers.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submitRoleRequests",
        entry: join(__dirname, "../lambda/user-management/submitRoleRequests.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "getTypes",
        entry: join(__dirname, "../lambda/getTypes.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "getSubTypes",
        entry: join(__dirname, "../lambda/getSubTypes.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "getCpocs",
        entry: join(__dirname, "../lambda/getCpocs.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "itemExists",
        entry: join(__dirname, "../lambda/itemExists.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "forms",
        entry: join(__dirname, "../lambda/getForm.ts"),
        environment: {},
      },
      {
        id: "getAllForms",
        entry: join(__dirname, "../lambda/getAllForms.ts"),
        environment: {},
      },
      {
        id: "updatePackage",
        entry: join(__dirname, "../lambda/update/updatePackage.ts"),
        environment: {
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "submitSplitSPA",
        entry: join(__dirname, "../lambda/submit/submitSplitSPA.ts"),
        environment: {
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submitNOSO",
        entry: join(__dirname, "../lambda/update/submitNOSO.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "getSystemNotifs",
        entry: join(__dirname, "../lambda/getSystemNotifs.ts"),
        environment: {
          notificationSecretName,
          notificationSecretArn,
        },
      },
    ];

    const lambdas = lambdaDefinitions.reduce(
      (acc, lambdaDef) => {
        acc[lambdaDef.id] = createNodeJsLambda(
          lambdaDef.id,
          lambdaDef.entry,
          lambdaDef.environment,
          vpc,
          lambdaSecurityGroup,
          privateSubnets,
          !props.isDev ? lambdaDef.provisionedConcurrency : 0,
        );
        return acc;
      },
      {} as { [key: string]: NodejsFunction },
    );

    // ==========================================
    // DataSink Lambda - Separate IAM Role with DynamoDB permissions
    // ==========================================
    const dataSinkLambdaRole = new cdk.aws_iam.Role(this, "DataSinkLambdaRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
      ],
      inlinePolicies: {
        DataSinkPolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            // DynamoDB permissions for idempotency table
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:Query",
              ],
              resources: [idempotencyTable.tableArn],
            }),
            // Kafka/MSK permissions (if needed for VPC connectivity)
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: [
                "kafka:DescribeCluster",
                "kafka:GetBootstrapBrokers",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    // DataSink Lambda Log Group
    const dataSinkLogGroup = new cdk.aws_logs.LogGroup(this, "dataSinkLogGroup", {
      logGroupName: `/aws/lambda/${project}-${stage}-${stack}-dataSink`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // DataSink Lambda Function
    const dataSinkLambda = new NodejsFunction(this, "dataSink", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      functionName: `${project}-${stage}-${stack}-dataSink`,
      depsLockFilePath: join(__dirname, "../../bun.lockb"),
      entry: join(__dirname, "../lambda/dataSink.ts"),
      handler: "handler",
      role: dataSinkLambdaRole,
      environment: {
        idempotencyTableName: idempotencyTable.tableName,
        smartTopicName,
        brokerString,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      retryAttempts: 0,
      vpc: vpc,
      securityGroups: [lambdaSecurityGroup],
      vpcSubnets: { subnets: privateSubnets },
      logGroup: dataSinkLogGroup,
      bundling: commonBundlingOptions,
    });

    // Add dataSink to lambdas object for alarm creation
    lambdas["dataSink"] = dataSinkLambda;

    // Create IAM role for API Gateway to invoke Lambda functions
    const apiGatewayRole = new cdk.aws_iam.Role(this, "ApiGatewayRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
      inlinePolicies: {
        InvokeLambdaPolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: ["arn:aws:lambda:*:*:function:*"],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.DENY,
              actions: ["logs:CreateLogGroup"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    const apiExecutionLogsLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "ApiGatewayExecutionLogsLogGroup",
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    // Define API Gateway
    const api = new cdk.aws_apigateway.RestApi(this, "APIGateway", {
      restApiName: `${project}-${stage}`,
      deployOptions: {
        stageName: stage,
        loggingLevel: cdk.aws_apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new cdk.aws_apigateway.LogGroupLogDestination(
          apiExecutionLogsLogGroup,
        ),
        accessLogFormat: cdk.aws_apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
      defaultCorsPreflightOptions: {
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
        ],
        allowCredentials: true,
      },
      endpointConfiguration: {
        types: [cdk.aws_apigateway.EndpointType.EDGE],
      },
    });

    // Add GatewayResponse for 4XX errors
    new cdk.aws_apigateway.CfnGatewayResponse(this, "GatewayResponseDefault4XX", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_4XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
    });

    // Add GatewayResponse for 5XX errors
    new cdk.aws_apigateway.CfnGatewayResponse(this, "GatewayResponseDefault5XX", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_5XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
    });

    // ==========================================
    // DataSink API Key and Usage Plan
    // ==========================================
    // Create API Key from the secret value
    const dataSinkApiKey = api.addApiKey("DataSinkApiKey", {
      apiKeyName: `${project}-${stage}-dataSink-api-key`,
      description: "API Key for dataSink endpoint (SMART/MuleSoft integration)",
      value: dataSinkApiKeySecret.secretValue.unsafeUnwrap(),
    });

    // Create Usage Plan with lenient rate limits
    const dataSinkUsagePlan = api.addUsagePlan("DataSinkUsagePlan", {
      name: `${project}-${stage}-dataSink-usage-plan`,
      description: "Usage plan for dataSink endpoint",
      throttle: {
        rateLimit: 1000, // requests per second
        burstLimit: 2000, // burst capacity
      },
      quota: {
        limit: 100000, // requests per day
        period: cdk.aws_apigateway.Period.DAY,
      },
    });

    // Associate API Key with Usage Plan
    dataSinkUsagePlan.addApiKey(dataSinkApiKey);

    // Associate Usage Plan with the API stage
    dataSinkUsagePlan.addApiStage({
      stage: api.deploymentStage,
    });

    // ==========================================
    // DataSink API Resource with API Key Required
    // ==========================================
    const dataSinkResource = api.root.addResource("dataSink");

    const dataSinkIntegration = new cdk.aws_apigateway.LambdaIntegration(dataSinkLambda, {
      proxy: true,
      credentialsRole: apiGatewayRole,
    });

    // Add POST method with API Key requirement (no IAM auth)
    dataSinkResource.addMethod("POST", dataSinkIntegration, {
      authorizationType: cdk.aws_apigateway.AuthorizationType.NONE,
      apiKeyRequired: true,
      methodResponses: [
        {
          statusCode: "202",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
        {
          statusCode: "400",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
          },
        },
        {
          statusCode: "500",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
          },
        },
      ],
    });

    const apiResources = {
      search: {
        path: "search/{index}",
        lambda: lambdas.search,
        method: "POST",
      },
      getPackageActions: {
        path: "getPackageActions",
        lambda: lambdas.getPackageActions,
        method: "POST",
      },
      getAttachmentUrl: {
        path: "getAttachmentUrl",
        lambda: lambdas.getAttachmentUrl,
        method: "POST",
      },
      getUploadUrl: {
        path: "getUploadUrl",
        lambda: lambdas.getUploadUrl,
        method: "POST",
      },
      requestBaseCMSAccess: {
        path: "requestBaseCMSAccess",
        lambda: lambdas.requestBaseCMSAccess,
        method: "GET",
      },
      createUserProfile: {
        path: "createUserProfile",
        lambda: lambdas.createUserProfile,
        method: "GET",
      },
      getUserDetails: {
        path: "getUserDetails",
        lambda: lambdas.getUserDetails,
        method: "POST",
      },
      getUserProfile: {
        path: "getUserProfile",
        lambda: lambdas.getUserProfile,
        method: "POST",
      },
      getApprovers: {
        path: "getApprovers",
        lambda: lambdas.getApprovers,
        method: "POST",
      },
      submitGroupDivision: {
        path: "submitGroupDivision",
        lambda: lambdas.submitGroupDivision,
        method: "POST",
      },
      updateUserRoles: {
        path: "updateUserRoles",
        lambda: lambdas.updateUserRoles,
        method: "POST",
      },
      getRoleRequests: {
        path: "getRoleRequests",
        lambda: lambdas.getRoleRequests,
        method: "GET",
      },
      submitRoleRequests: {
        path: "submitRoleRequests",
        lambda: lambdas.submitRoleRequests,
        method: "POST",
      },
      item: { path: "item", lambda: lambdas.item, method: "POST" },
      submit: { path: "submit", lambda: lambdas.submit, method: "POST" },
      getTypes: {
        path: "getTypes",
        lambda: lambdas.getTypes,
        method: "POST",
      },
      getSubTypes: {
        path: "getSubTypes",
        lambda: lambdas.getSubTypes,
        method: "POST",
      },
      getCpocs: {
        path: "getCpocs",
        lambda: lambdas.getCpocs,
        method: "POST",
      },
      itemExists: {
        path: "itemExists",
        lambda: lambdas.itemExists,
        method: "POST",
      },
      forms: { path: "forms", lambda: lambdas.forms, method: "POST" },
      allForms: {
        path: "allForms",
        lambda: lambdas.getAllForms,
        method: "GET",
      },
      getSystemNotifs: { path: "systemNotifs", lambda: lambdas.getSystemNotifs, method: "GET" },
    };

    const addApiResource = (
      path: string,
      lambdaFunction: cdk.aws_lambda.Function,
      method: string = "POST",
    ) => {
      const resource = api.root.resourceForPath(path);

      // Define the integration for the Lambda function
      const integration = new cdk.aws_apigateway.LambdaIntegration(lambdaFunction, {
        proxy: true,
        credentialsRole: apiGatewayRole,
      });

      // Add method for specified HTTP method
      resource.addMethod(method, integration, {
        authorizationType: cdk.aws_apigateway.AuthorizationType.IAM,
        apiKeyRequired: false,
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
            },
          },
        ],
      });
    };

    Object.values(apiResources).forEach((resource) => {
      addApiResource(resource.path, resource.lambda, resource.method);
    });

    // Define CloudWatch Alarms
    const createCloudWatchAlarm = (id: string, lambdaFunction: cdk.aws_lambda.Function) => {
      const alarm = new cdk.aws_cloudwatch.Alarm(this, id, {
        alarmName: `${project}-${stage}-${id}Alarm`,
        metric: new cdk.aws_cloudwatch.Metric({
          namespace: `${project}-api/Errors`,
          metricName: "LambdaErrorCount",
          dimensionsMap: {
            FunctionName: lambdaFunction.functionName,
          },
          statistic: "Sum",
          period: cdk.Duration.minutes(5),
        }),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator:
          cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      alarm.addAlarmAction({
        bind: () => ({
          alarmActionArn: alertsTopic.topicArn!,
        }),
      });
    };

    Object.values(lambdas).forEach((lambdaFunc) => {
      createCloudWatchAlarm(`${lambdaFunc.node.id}ErrorAlarm`, lambdaFunc);
    });

    const waf = new LC.RegionalWaf(this, "WafConstruct", {
      name: `${project}-${stage}-${stack}`,
      apiGateway: api,
    });

    const logBucket = new Bucket(this, "LogBucket", {
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: isDev,
    });

    logBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ["s3:*"],
        resources: [logBucket.bucketArn, `${logBucket.bucketArn}/*`],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    new LC.EmptyBuckets(this, "EmptyBuckets", {
      buckets: [],
    });

    if (!isDev) {
      new LC.CloudWatchToS3(this, "CloudWatchToS3Construct", {
        logGroup: waf.logGroup,
        bucket: logBucket,
      });
    }

    return { apiGateway: api };
  }
}
