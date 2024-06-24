import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { cdkExport, cdkImport } from "./utils/cdk-export";

interface ApiStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  vpcInfo: {
    id: string;
    privateSubnets: string[];
  };
  brokerString: string;
  dbInfo: {
    ip: string;
    port: string;
    user: string;
    password: string;
  };
  onemacLegacyS3AccessRoleArn: string;
}

export class ApiStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    this.initializeResources(props);
  }

  private initializeResources(props: ApiStackProps) {
    const {
      project,
      stage,
      vpcInfo,
      brokerString,
      dbInfo,
      onemacLegacyS3AccessRoleArn,
    } = props;

    const privateSubnets = vpcInfo.privateSubnets.map((subnetId: string) =>
      ec2.Subnet.fromSubnetId(this, `Subnet${subnetId}`, subnetId)
    );
    const vpc = ec2.Vpc.fromLookup(this, "MyVpc", {
      vpcId: vpcInfo.id,
    });
    const lambdaSecurityGroupId = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `networking`,
      "lambdaSecurityGroupId"
    ).getAttString("Value");
    const importedLambdaSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "ImportedSecurityGroup",
      lambdaSecurityGroupId
    );
    const osDomain = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `data`,
      "openSearchDomainEndpoint"
    ).getAttString("Value");

    const osDomainArn = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `data`,
      "openSearchDomainArn"
    ).getAttString("Value");

    const topicName = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `data`,
      "topicName"
    ).getAttString("Value");

    const attachmentsBucketArn = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `uploads`,
      "attachmentsBucketArn"
    ).getAttString("Value");

    const attachmentsBucketName = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `uploads`,
      "attachmentsBucketName"
    ).getAttString("Value");

    const attachmentsBucketRegion = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `uploads`,
      "attachmentsBucketRegion"
    ).getAttString("Value");

    const ecsFailureTopicArn = cdkImport(
      this,
      this.node.id,
      project,
      stage,
      `alerts`,
      "ecsFailureTopicArn"
    ).getAttString("Value");

    // -- Set some important variables --
    const isDev = !["master", "val", "production"].includes(stage);

    // Define IAM role
    const lambdaRole = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      path: "/delegatedadmin/developer/",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
      ],
      inlinePolicies: {
        LambdaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "es:ESHttpHead",
                "es:ESHttpPost",
                "es:ESHttpGet",
                "es:ESHttpPatch",
                "es:ESHttpDelete",
                "es:ESHttpPut",
              ],
              resources: [`${osDomainArn}/*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["cognito-idp:GetUser", "cognito-idp:ListUsers"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [onemacLegacyS3AccessRoleArn],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "s3:PutObject",
                "s3:PutObjectTagging",
                "s3:GetObject",
                "s3:GetObjectTagging",
              ],
              resources: [`${attachmentsBucketArn}/*`],
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
      vpc?: ec2.IVpc,
      securityGroup?: ec2.ISecurityGroup,
      subnets?: ec2.ISubnet[]
    ) => {
      // Remove any undefined values from the environment object
      const sanitizedEnvironment: { [key: string]: string } = {};
      for (const key in environment) {
        if (environment[key] !== undefined) {
          sanitizedEnvironment[key] = environment[key] as string;
        }
      }

      const logGroup = new logs.LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${this.node.id}-${id}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      return new NodejsFunction(this, id, {
        runtime: lambda.Runtime.NODEJS_18_X,
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
    };

    const lambdaDefinitions = [
      {
        id: "GetUploadUrlLambda",
        entry: path.join(__dirname, "lambda/getUploadUrl.ts"),
        environment: {
          attachmentsBucketName,
          attachmentsBucketRegion,
        },
      },
      {
        id: "SearchLambda",
        entry: path.join(__dirname, "lambda/search.ts"),
        environment: {
          osDomain,
        },
      },
      {
        id: "GetPackageActionsLambda",
        entry: path.join(__dirname, "lambda/getPackageActions.ts"),
        environment: {
          osDomain,
          onemacLegacyS3AccessRoleArn,
        },
      },
      {
        id: "GetAttachmentUrlLambda",
        entry: path.join(__dirname, "lambda/getAttachmentUrl.ts"),
        environment: {
          osDomain,
          onemacLegacyS3AccessRoleArn,
        },
      },
      {
        id: "ItemLambda",
        entry: path.join(__dirname, "lambda/item.ts"),
        environment: {
          osDomain,
        },
      },
      {
        id: "SubmitLambda",
        entry: path.join(__dirname, "lambda/submit.ts"),
        environment: {
          dbIp: dbInfo.ip,
          dbPort: dbInfo.port,
          dbUser: dbInfo.user,
          dbPassword: dbInfo.password,
          topicName,
          brokerString,
          osDomain,
        },
      },
      {
        id: "ActionLambda",
        entry: path.join(__dirname, "lambda/action.ts"),
        environment: {
          dbIp: dbInfo.ip,
          dbPort: dbInfo.port,
          dbUser: dbInfo.user,
          dbPassword: dbInfo.password,
          topicName,
          brokerString,
          osDomain,
        },
      },
      {
        id: "GetTypesLambda",
        entry: path.join(__dirname, "lambda/getTypes.ts"),
        environment: {
          osDomain,
        },
      },
      {
        id: "GetSubTypesLambda",
        entry: path.join(__dirname, "lambda/getSubTypes.ts"),
        environment: {
          osDomain,
        },
      },
      {
        id: "GetCpocsLambda",
        entry: path.join(__dirname, "lambda/getCpocs.ts"),
        environment: {
          osDomain,
        },
      },
      {
        id: "ItemExistsLambda",
        entry: path.join(__dirname, "lambda/itemExists.ts"),
        environment: {
          osDomain,
        },
      },
      {
        id: "FormsLambda",
        entry: path.join(__dirname, "lambda/getForm.ts"),
        environment: {
          osDomain,
        },
      },
      {
        id: "GetAllFormsLambda",
        entry: path.join(__dirname, "lambda/getAllForms.ts"),
        environment: {
          osDomain,
        },
      },
      {
        id: "AppkNewSubmissionLambda",
        entry: path.join(__dirname, "lambda/appkNewSubmission.ts"),
        environment: {
          dbIp: dbInfo.ip,
          dbPort: dbInfo.port,
          dbUser: dbInfo.user,
          dbPassword: dbInfo.password,
          topicName,
          brokerString,
          osDomain,
        },
      },
    ];

    const lambdas = lambdaDefinitions.reduce((acc, lambdaDef) => {
      acc[lambdaDef.id] = createNodeJsLambda(
        lambdaDef.id,
        lambdaDef.entry,
        lambdaDef.environment,
        vpc,
        importedLambdaSecurityGroup,
        privateSubnets
      );
      return acc;
    }, {} as { [key: string]: NodejsFunction });

    // Create IAM role for API Gateway to invoke Lambda functions
    const apiGatewayRole = new iam.Role(this, "ApiGatewayRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    // Attach policy to allow invoking all Lambda functions
    apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["lambda:InvokeFunction"],
        resources: ["arn:aws:lambda:*:*:function:*"], // Adjust to limit to your Lambda functions
      })
    );

    // Define API Gateway
    const api = new apigateway.RestApi(this, "APIGateway", {
      restApiName: `${this.node.id}`,
      deployOptions: {
        stageName: stage,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
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
    });

    // Add GatewayResponse for 4XX errors
    new apigateway.CfnGatewayResponse(this, "GatewayResponseDefault4XX", {
      restApiId: api.restApiId,
      responseType: "DEFAULT_4XX",
      responseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
    });

    // Add GatewayResponse for 5XX errors
    new apigateway.CfnGatewayResponse(this, "GatewayResponseDefault5XX", {
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
        lambda: lambdas.SearchLambda,
        method: "POST",
      },
      getPackageActions: {
        path: "getPackageActions",
        lambda: lambdas.GetPackageActionsLambda,
        method: "POST",
      },
      getAttachmentUrl: {
        path: "getAttachmentUrl",
        lambda: lambdas.GetAttachmentUrlLambda,
        method: "POST",
      },
      getUploadUrl: {
        path: "getUploadUrl",
        lambda: lambdas.GetUploadUrlLambda,
        method: "POST",
      },
      item: { path: "item", lambda: lambdas.ItemLambda, method: "POST" },
      submit: { path: "submit", lambda: lambdas.SubmitLambda, method: "POST" },
      action: {
        path: "action/{actionType}",
        lambda: lambdas.ActionLambda,
        method: "POST",
      },
      getTypes: {
        path: "getTypes",
        lambda: lambdas.GetTypesLambda,
        method: "POST",
      },
      getSubTypes: {
        path: "getSubTypes",
        lambda: lambdas.GetSubTypesLambda,
        method: "POST",
      },
      getCpocs: {
        path: "getCpocs",
        lambda: lambdas.GetCpocsLambda,
        method: "POST",
      },
      itemExists: {
        path: "itemExists",
        lambda: lambdas.ItemExistsLambda,
        method: "POST",
      },
      forms: { path: "forms", lambda: lambdas.FormsLambda, method: "POST" },
      allForms: {
        path: "allForms",
        lambda: lambdas.GetAllFormsLambda,
        method: "GET",
      },
      appk: {
        path: "appk",
        lambda: lambdas.AppkNewSubmissionLambda,
        method: "POST",
      },
    };

    const addApiResource = (
      path: string,
      lambdaFunction: lambda.Function,
      method: string = "POST"
    ) => {
      const resource = api.root.resourceForPath(path);

      // Define the integration for the Lambda function
      const integration = new apigateway.LambdaIntegration(lambdaFunction, {
        proxy: true,
        credentialsRole: apiGatewayRole,
      });

      // Add method for specified HTTP method
      resource.addMethod(method, integration, {
        authorizationType: apigateway.AuthorizationType.IAM,
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
      lambdaFunction: lambda.Function
    ) => {
      const alarm = new cloudwatch.Alarm(this, id, {
        alarmName: `${this.node.id}-${id}Alarm`,
        metric: new cloudwatch.Metric({
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
          cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      alarm.addAlarmAction({
        bind: () => ({
          alarmActionArn: ecsFailureTopicArn!,
        }),
      });
    };

    Object.values(lambdas).forEach((lambdaFunc) => {
      createCloudWatchAlarm(`${lambdaFunc.node.id}ErrorAlarm`, lambdaFunc);
    });

    cdkExport(this, this.node.id, "apiGatewayRestApiName", api.restApiName);
    cdkExport(this, this.node.id, "apiGatewayRestApiId", api.restApiId);
    cdkExport(
      this,
      this.node.id,
      "apiGatewayRestApiUrl",
      `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/${stage}`
    );
  }
}
