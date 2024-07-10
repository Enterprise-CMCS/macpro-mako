import { join } from "path";

import {
  Duration,
  NestedStack,
  NestedStackProps,
  RemovalPolicy,
} from "aws-cdk-lib";
import {
  Alarm,
  ComparisonOperator,
  Metric,
  TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import { IVpc, ISubnet, ISecurityGroup } from "aws-cdk-lib/aws-ec2";
import {
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Alias, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Topic } from "aws-cdk-lib/aws-sns";
import {
  RestApi,
  MethodLoggingLevel,
  Cors,
  EndpointType,
  LogGroupLogDestination,
  AccessLogFormat,
  LambdaIntegration,
  AuthorizationType,
  CfnGatewayResponse,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

import { DeploymentConfigProperties } from "./deployment-config";
import { CloudWatchToS3 } from "local-constructs";
import { EmptyBuckets } from "local-constructs";
import { RegionalWaf } from "local-constructs";

interface ApiStackProps extends NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpc: IVpc;
  privateSubnets: ISubnet[];
  lambdaSecurityGroup: ISecurityGroup;
  topicNamespace: string;
  indexNamespace: string;
  openSearchDomainArn: string;
  openSearchDomainEndpoint: string;
  alertsTopic: Topic;
  attachmentsBucket: Bucket;
  brokerString: DeploymentConfigProperties["brokerString"];
  dbInfoSecretName: DeploymentConfigProperties["dbInfoSecretName"];
  legacyS3AccessRoleArn: DeploymentConfigProperties["legacyS3AccessRoleArn"];
}

export class ApiStack extends NestedStack {
  public readonly apiGateway: RestApi;
  public readonly apiGatewayUrl: string;
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.apiGateway = resources.apiGateway;
    this.apiGatewayUrl = `https://${this.apiGateway.restApiId}.execute-api.${this.region}.amazonaws.com/${props.stage}`;
  }

  private initializeResources(props: ApiStackProps): {
    apiGateway: RestApi;
  } {
    const { project, stage, stack, isDev } = props;
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
    const lambdaRole = new Role(this, "LambdaExecutionRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ),
        ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
      ],
      inlinePolicies: {
        LambdaPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
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
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["cognito-idp:GetUser", "cognito-idp:ListUsers"],
              resources: ["*"],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [legacyS3AccessRoleArn],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                "s3:PutObject",
                "s3:PutObjectTagging",
                "s3:GetObject",
                "s3:GetObjectTagging",
              ],
              resources: [`${attachmentsBucket.bucketArn}/*`],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
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
      vpc?: IVpc,
      securityGroup?: ISecurityGroup,
      subnets?: ISubnet[],
      provisionedConcurrency: number = 0,
    ) => {
      // Remove any undefined values from the environment object
      const sanitizedEnvironment: { [key: string]: string } = {};
      for (const key in environment) {
        if (environment[key] !== undefined) {
          sanitizedEnvironment[key] = environment[key] as string;
        }
      }

      const logGroup = new LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-${id}`,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      const fn = new NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_18_X,
        functionName: `${project}-${stage}-${stack}-${id}`,
        entry,
        handler: "handler",
        role: lambdaRole,
        environment: sanitizedEnvironment,
        timeout: Duration.seconds(30),
        memorySize: 1024,
        retryAttempts: 0,
        vpc: vpc,
        securityGroups: securityGroup ? [securityGroup] : undefined,
        vpcSubnets: subnets ? { subnets } : undefined,
        logGroup,
      });

      if (provisionedConcurrency > 0) {
        const version = fn.currentVersion;

        // Configure provisioned concurrency
        new Alias(this, `FunctionAlias${id}`, {
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
        entry: join(__dirname, "lambda/getUploadUrl.ts"),
        environment: {
          attachmentsBucketName: attachmentsBucket.bucketName,
          attachmentsBucketRegion: this.region,
        },
      },
      {
        id: "search",
        entry: join(__dirname, "lambda/search.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 4,
      },
      {
        id: "getPackageActions",
        entry: join(__dirname, "lambda/getPackageActions.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          legacyS3AccessRoleArn,
          indexNamespace,
        },
      },
      {
        id: "getAttachmentUrl",
        entry: join(__dirname, "lambda/getAttachmentUrl.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          legacyS3AccessRoleArn,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "item",
        entry: join(__dirname, "lambda/item.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: 2,
      },
      {
        id: "submit",
        entry: join(__dirname, "lambda/submit.ts"),
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
        entry: join(__dirname, "lambda/action.ts"),
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
        entry: join(__dirname, "lambda/getTypes.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "getSubTypes",
        entry: join(__dirname, "lambda/getSubTypes.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "getCpocs",
        entry: join(__dirname, "lambda/getCpocs.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "itemExists",
        entry: join(__dirname, "lambda/itemExists.ts"),
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
      },
      {
        id: "forms",
        entry: join(__dirname, "lambda/getForm.ts"),
        environment: {},
      },
      {
        id: "getAllForms",
        entry: join(__dirname, "lambda/getAllForms.ts"),
        environment: {},
      },
      {
        id: "appkNewSubmission",
        entry: join(__dirname, "lambda/appkNewSubmission.ts"),
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
    const apiGatewayRole = new Role(this, "ApiGatewayRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      inlinePolicies: {
        InvokeLambdaPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: ["arn:aws:lambda:*:*:function:*"],
            }),
            new PolicyStatement({
              effect: Effect.DENY,
              actions: ["logs:CreateLogGroup"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    const apiExecutionLogsLogGroup = new LogGroup(
      this,
      "ApiGatewayExecutionLogsLogGroup",
      {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    );

    // Define API Gateway
    const api = new RestApi(this, "APIGateway", {
      restApiName: `${project}-${stage}`,
      deployOptions: {
        stageName: stage,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new LogGroupLogDestination(
          apiExecutionLogsLogGroup,
        ),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
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
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
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
        types: [EndpointType.EDGE],
      },
    });

    // Add GatewayResponse for 4XX errors
    new CfnGatewayResponse(this, "GatewayResponseDefault4XX", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_4XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
    });

    // Add GatewayResponse for 5XX errors
    new CfnGatewayResponse(this, "GatewayResponseDefault5XX", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_5XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
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
      lambdaFunction: Function,
      method: string = "POST",
    ) => {
      const resource = api.root.resourceForPath(path);

      // Define the integration for the Lambda function
      const integration = new LambdaIntegration(lambdaFunction, {
        proxy: true,
        credentialsRole: apiGatewayRole,
      });

      // Add method for specified HTTP method
      resource.addMethod(method, integration, {
        authorizationType: AuthorizationType.IAM,
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
    const createCloudWatchAlarm = (id: string, lambdaFunction: Function) => {
      const alarm = new Alarm(this, id, {
        alarmName: `${project}-${stage}-${id}Alarm`,
        metric: new Metric({
          namespace: `${project}-api/Errors`,
          metricName: "LambdaErrorCount",
          dimensionsMap: {
            FunctionName: lambdaFunction.functionName,
          },
          statistic: "Sum",
          period: Duration.minutes(5),
        }),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
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

    const waf = new RegionalWaf(this, "WafConstruct", {
      name: `${project}-${stage}-${stack}`,
      apiGateway: api,
    });

    const cloudwatchToS3 = new CloudWatchToS3(this, "CloudWatchToS3Construct", {
      logGroup: waf.logGroup,
    });

    new EmptyBuckets(this, "EmptyBuckets", {
      buckets: [cloudwatchToS3.logBucket],
    });

    return { apiGateway: api };
  }
}
