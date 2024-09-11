import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { DeploymentConfigProperties } from "../config/deployment-config";
import * as LC from "local-constructs";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { commonBundlingOptions } from "../config/bundling-config";

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
    const { project, stage, stack } = props;
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
    } = props;

    const topicName = `${topicNamespace}aws.onemac.migration.cdc`;

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
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "CloudWatchLogsFullAccess",
        ),
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
              actions: [
                "secretsmanager:DescribeSecret",
                "secretsmanager:GetSecretValue",
              ],
              resources: [
                `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${dbInfoSecretName}-*`,
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
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
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
        entry: join(__dirname, "../lambda/submit/submit.ts"),
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
        id: "action",
        entry: join(__dirname, "../lambda/action.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
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
        id: "appkNewSubmission",
        entry: join(__dirname, "../lambda/appkNewSubmission.ts"),
        environment: {
          dbInfoSecretName,
          topicName,
          brokerString,
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
    ];

    const lambdas = lambdaDefinitions.reduce((acc, lambdaDef) => {
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
    }, {} as { [key: string]: NodejsFunction });

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
        accessLogFormat:
          cdk.aws_apigateway.AccessLogFormat.jsonWithStandardFields({
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
    new cdk.aws_apigateway.CfnGatewayResponse(
      this,
      "GatewayResponseDefault4XX",
      {
        restApiId: api.restApiId,
        responseType: "DEFAULT_4XX",
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        },
      },
    );

    // Add GatewayResponse for 5XX errors
    new cdk.aws_apigateway.CfnGatewayResponse(
      this,
      "GatewayResponseDefault5XX",
      {
        restApiId: api.restApiId,
        responseType: "DEFAULT_5XX",
        responseParameters: {
          "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
          "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
        },
      },
    );

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
      item: { path: "item", lambda: lambdas.item, method: "POST" },
      submit: { path: "submit", lambda: lambdas.submit, method: "POST" },
      action: {
        path: "action/{actionType}",
        lambda: lambdas.action,
        method: "POST",
      },
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
      appk: {
        path: "appk",
        lambda: lambdas.appkNewSubmission,
        method: "POST",
      },
    };

    const addApiResource = (
      path: string,
      lambdaFunction: cdk.aws_lambda.Function,
      method: string = "POST",
    ) => {
      const resource = api.root.resourceForPath(path);

      // Define the integration for the Lambda function
      const integration = new cdk.aws_apigateway.LambdaIntegration(
        lambdaFunction,
        {
          proxy: true,
          credentialsRole: apiGatewayRole,
        },
      );

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
    const createCloudWatchAlarm = (
      id: string,
      lambdaFunction: cdk.aws_lambda.Function,
    ) => {
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
          cdk.aws_cloudwatch.ComparisonOperator
            .GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
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

    const emptyBuckets = new LC.EmptyBuckets(this, "EmptyBuckets", {
      buckets: [logBucket],
    });

    const cloudwatchToS3 = new LC.CloudWatchToS3(
      this,
      "CloudWatchToS3Construct",
      {
        logGroup: waf.logGroup,
        bucket: logBucket,
      },
    );
    cloudwatchToS3.node.addDependency(emptyBuckets);

    return { apiGateway: api };
  }
}
