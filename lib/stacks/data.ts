import * as cdk from "aws-cdk-lib";
import * as cr from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import * as LC from "local-constructs";
import { readFileSync } from "fs";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { commonBundlingOptions } from "../config/bundling-config";

interface DataStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpc: cdk.aws_ec2.IVpc;
  privateSubnets: cdk.aws_ec2.ISubnet[];
  brokerString: string;
  lambdaSecurityGroup: cdk.aws_ec2.ISecurityGroup;
  topicNamespace: string;
  indexNamespace: string;
  sharedOpenSearchDomainEndpoint: string;
  sharedOpenSearchDomainArn: string;
  devPasswordArn: string;
}

export class Data extends cdk.NestedStack {
  public readonly openSearchDomainArn: string;
  public readonly openSearchDomainEndpoint: string;
  private mapRoleCustomResource: cdk.CustomResource;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.openSearchDomainEndpoint = resources.openSearchDomainEndpoint;
    this.openSearchDomainArn = resources.openSearchDomainArn;
  }

  private initializeResources(props: DataStackProps): {
    openSearchDomainArn: string;
    openSearchDomainEndpoint: string;
  } {
    const {
      project,
      stage,
      stack,
      isDev,
      vpc,
      privateSubnets,
      brokerString,
      lambdaSecurityGroup,
      topicNamespace,
      indexNamespace,
      sharedOpenSearchDomainEndpoint,
      sharedOpenSearchDomainArn,
      devPasswordArn,
    } = props;
    const consumerGroupPrefix = `--${project}--${stage}--`;

    let openSearchDomainEndpoint;
    let openSearchDomainArn;

    const usingSharedOpenSearch = sharedOpenSearchDomainEndpoint && sharedOpenSearchDomainArn;

    if (usingSharedOpenSearch) {
      openSearchDomainEndpoint = sharedOpenSearchDomainEndpoint;
      openSearchDomainArn = sharedOpenSearchDomainArn;
    } else {
      const userPool = new cdk.aws_cognito.UserPool(this, "UserPool", {
        userPoolName: `${project}-${stage}-search`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        selfSignUpEnabled: false,
        signInAliases: { email: true },
        autoVerify: { email: true },
        standardAttributes: { email: { required: true, mutable: true } },
      });

      new cdk.aws_cognito.UserPoolDomain(this, "UserPoolDomain", {
        userPool,
        cognitoDomain: {
          domainPrefix: `${project}-${stage}-search`,
        },
      });

      const userPoolClient = new cdk.aws_cognito.UserPoolClient(this, "UserPoolClient", {
        userPool,
        authFlows: { adminUserPassword: true },
      });

      const identityPool = new cdk.aws_cognito.CfnIdentityPool(this, "IdentityPool", {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.userPoolClientId,
            providerName: userPool.userPoolProviderName,
          },
        ],
      });

      const cognitoAuthRole = new cdk.aws_iam.Role(this, "CognitoAuthRole", {
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
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonCognitoReadOnly"),
        ],
      });

      cognitoAuthRole.assumeRolePolicy?.addStatements(
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          principals: [new cdk.aws_iam.ServicePrincipal("es.amazonaws.com")],
          actions: ["sts:AssumeRole"],
        }),
      );

      new cdk.aws_cognito.CfnIdentityPoolRoleAttachment(this, "IdentityPoolRoleAttachment", {
        identityPoolId: identityPool.ref,
        roles: { authenticated: cognitoAuthRole.roleArn },
      });

      const openSearchSecurityGroup = new cdk.aws_ec2.SecurityGroup(
        this,
        "OpenSearchSecurityGroup",
        {
          vpc,
          description: "Security group for OpenSearch",
        },
      );
      openSearchSecurityGroup.addIngressRule(
        cdk.aws_ec2.Peer.ipv4("10.0.0.0/8"),
        cdk.aws_ec2.Port.tcp(443),
        "Allow HTTPS access from VPC",
      );

      const openSearchRole = new cdk.aws_iam.Role(this, "OpenSearchRole", {
        assumedBy: new cdk.aws_iam.ServicePrincipal("es.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonOpenSearchServiceCognitoAccess",
          ),
        ],
      });

      const openSearchMasterRole = new cdk.aws_iam.Role(this, "OpenSearchMasterRole", {
        assumedBy: new cdk.aws_iam.ServicePrincipal("es.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonOpenSearchServiceFullAccess"),
        ],
      });

      openSearchMasterRole.assumeRolePolicy?.addStatements(
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          principals: [new cdk.aws_iam.AccountPrincipal(cdk.Stack.of(this).account)],
          actions: ["sts:AssumeRole"],
        }),
      );

      const openSearchDomain = new cdk.aws_opensearchservice.CfnDomain(this, "OpenSearchDomain", {
        ebsOptions: { ebsEnabled: true, volumeType: "gp3", volumeSize: 20 },
        clusterConfig: {
          instanceType: "or1.medium.search",
          instanceCount: 3,
          dedicatedMasterEnabled: false,
          zoneAwarenessEnabled: true,
          zoneAwarenessConfig: { availabilityZoneCount: 3 },
        },
        encryptionAtRestOptions: { enabled: true },
        nodeToNodeEncryptionOptions: { enabled: true },
        domainEndpointOptions: {
          enforceHttps: true,
          tlsSecurityPolicy: "Policy-Min-TLS-1-2-PFS-2023-10",
        },
        cognitoOptions: {
          enabled: true,
          identityPoolId: identityPool.ref,
          roleArn: openSearchRole.roleArn,
          userPoolId: userPool.userPoolId,
        },
        accessPolicies: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              actions: ["es:*"],
              principals: [new cdk.aws_iam.ArnPrincipal(cognitoAuthRole.roleArn)],
              resources: ["*"],
            }),
          ],
        }),
        advancedSecurityOptions: {
          enabled: true,
          internalUserDatabaseEnabled: false,
          masterUserOptions: { masterUserArn: openSearchMasterRole.roleArn },
        },
        vpcOptions: {
          securityGroupIds: [openSearchSecurityGroup.securityGroupId],
          subnetIds: privateSubnets.map((subnet) => subnet.subnetId),
        },
        logPublishingOptions: {
          AUDIT_LOGS: {
            enabled: true,
            cloudWatchLogsLogGroupArn: new cdk.aws_logs.LogGroup(this, "OpenSearchAuditLogGroup", {
              logGroupName: `/aws/opensearch/${project}-${stage}-audit-logs`,
              removalPolicy: cdk.RemovalPolicy.DESTROY,
            }).logGroupArn,
          },
          INDEX_SLOW_LOGS: {
            enabled: true,
            cloudWatchLogsLogGroupArn: new cdk.aws_logs.LogGroup(
              this,
              "OpenSearchIndexSlowLogGroup",
              {
                logGroupName: `/aws/opensearch/${project}-${stage}-index-slow-logs`,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
              },
            ).logGroupArn,
          },
          SEARCH_SLOW_LOGS: {
            enabled: true,
            cloudWatchLogsLogGroupArn: new cdk.aws_logs.LogGroup(
              this,
              "OpenSearchSearchSlowLogGroup",
              {
                logGroupName: `/aws/opensearch/${project}-${stage}-search-slow-logs`,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
              },
            ).logGroupArn,
          },
          ES_APPLICATION_LOGS: {
            enabled: true,
            cloudWatchLogsLogGroupArn: new cdk.aws_logs.LogGroup(
              this,
              "OpenSearchApplicationLogGroup",
              {
                logGroupName: `/aws/opensearch/${project}-${stage}-application-logs`,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
              },
            ).logGroupArn,
          },
        },
      });

      new LC.ManageUsers(
        this,
        "ManageUsers",
        userPool,
        JSON.parse(readFileSync(join(__dirname, "../../test/users/kibana-users.json"), "utf8")),
        devPasswordArn,
      );

      const mapRole = new NodejsFunction(this, "MapRoleLambdaFunction", {
        functionName: `${project}-${stage}-${stack}-mapRole`,
        entry: join(__dirname, "../lambda/mapRole.ts"),
        handler: "handler",
        depsLockFilePath: join(__dirname, "../../bun.lockb"),
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        role: new cdk.aws_iam.Role(this, "MapRoleLambdaExecutionRole", {
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
            LambdaAssumeRolePolicy: new cdk.aws_iam.PolicyDocument({
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
                  resources: [`${openSearchDomain.attrArn}/*`],
                }),
                new cdk.aws_iam.PolicyStatement({
                  effect: cdk.aws_iam.Effect.ALLOW,
                  actions: ["sts:AssumeRole"],
                  resources: [openSearchMasterRole.roleArn],
                }),
              ],
            }),
          },
        }),
        vpc,
        vpcSubnets: {
          subnets: privateSubnets,
        },
        securityGroups: [lambdaSecurityGroup],
        environment: {
          brokerString,
          region: cdk.Stack.of(this).region,
          osDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
        },
        bundling: commonBundlingOptions,
      });

      const customResourceProvider = new cdk.custom_resources.Provider(
        this,
        "CustomResourceProvider",
        {
          onEventHandler: mapRole,
        },
      );

      this.mapRoleCustomResource = new cdk.CustomResource(this, "MapRole", {
        serviceToken: customResourceProvider.serviceToken,
        properties: {
          OsDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
          IamRoleName: `arn:aws:iam::${cdk.Stack.of(this).account}:role/*`,
          MasterRoleToAssume: openSearchMasterRole.roleArn,
          OsRoleName: "all_access",
        },
      });

      openSearchDomainEndpoint = openSearchDomain.attrDomainEndpoint;
      openSearchDomainArn = openSearchDomain.attrArn;
    }

    new LC.CreateTopics(this, "createTopics", {
      brokerString,
      privateSubnets: privateSubnets,
      securityGroups: [lambdaSecurityGroup],
      topics: [
        {
          topic: `${topicNamespace}aws.onemac.migration.cdc`,
        },
      ],
      vpc,
    });

    if (isDev) {
      new LC.CleanupKafka(this, "cleanupKafka", {
        vpc,
        privateSubnets: privateSubnets,
        securityGroups: [lambdaSecurityGroup],
        brokerString,
        topicPatternsToDelete: [`${topicNamespace}aws.onemac.migration.cdc`],
      });
    }

    const createLambda = ({
      id,
      entry = `${id}.ts`,
      role,
      useVpc = false,
      environment = {},
      timeout = cdk.Duration.minutes(5),
      memorySize = 1024,
      provisionedConcurrency = 0,
    }: {
      id: string;
      entry?: string;
      role: cdk.aws_iam.Role;
      useVpc?: boolean;
      environment?: { [key: string]: string };
      timeout?: cdk.Duration;
      memorySize?: number;
      provisionedConcurrency?: number;
    }) => {
      const logGroup = new cdk.aws_logs.LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-${id}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
      const fn = new NodejsFunction(this, id, {
        functionName: `${project}-${stage}-${stack}-${id}`,
        depsLockFilePath: join(__dirname, "../../bun.lockb"),
        entry: join(__dirname, `../lambda/${entry}`),
        handler: "handler",
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        role,
        memorySize,
        vpc: useVpc ? vpc : undefined,
        vpcSubnets: useVpc ? { subnets: privateSubnets } : undefined,
        securityGroups: useVpc ? [lambdaSecurityGroup] : undefined,
        environment,
        logGroup,
        timeout,
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

    const sharedLambdaRole = new cdk.aws_iam.Role(this, "SharedLambdaExecutionRole", {
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
              actions: [
                "lambda:CreateEventSourceMapping",
                "lambda:ListEventSourceMappings",
                "lambda:PutFunctionConcurrency",
                "lambda:DeleteEventSourceMapping",
                "lambda:UpdateEventSourceMapping",
                "lambda:GetEventSourceMapping",
              ],
              resources: ["*"],
            }),
            new cdk.aws_iam.PolicyStatement({
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ["ec2:DescribeSecurityGroups", "ec2:DescribeVpcs"],
              resources: ["*"],
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

    const functionConfigs = {
      sinkChangelog: { provisionedConcurrency: 2 },
      sinkCpocs: { provisionedConcurrency: 0 },
      sinkInsights: { provisionedConcurrency: 0 },
      sinkLegacyInsights: { provisionedConcurrency: 0 },
      sinkMain: { provisionedConcurrency: 2 },
      sinkSubtypes: { provisionedConcurrency: 0 },
      sinkTypes: { provisionedConcurrency: 0 },
    };

    const lambdaFunctions = Object.entries(functionConfigs).reduce((acc, [name, config]) => {
      acc[name] = createLambda({
        id: name,
        role: sharedLambdaRole,
        useVpc: true,
        environment: {
          osDomain: `https://${openSearchDomainEndpoint}`,
          indexNamespace,
        },
        provisionedConcurrency: !props.isDev ? config.provisionedConcurrency : 0,
      });
      return acc;
    }, {} as { [key: string]: NodejsFunction });

    const stateMachineRole = new cdk.aws_iam.Role(this, "StateMachineRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("states.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
      ],
      inlinePolicies: {
        StateMachinePolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              actions: ["lambda:InvokeFunction"],
              resources: [
                `arn:aws:lambda:${cdk.Stack.of(this).region}:${
                  cdk.Stack.of(this).account
                }:function:${project}-${stage}-${stack}-*`,
              ],
            }),
          ],
        }),
      },
    });

    const cfnNotify = createLambda({
      id: "cfnNotify",
      entry: "cfnNotify.ts",
      role: sharedLambdaRole,
    });
    const createTriggers = createLambda({
      id: "createTriggers",
      role: sharedLambdaRole,
      timeout: cdk.Duration.minutes(15),
    });
    const checkConsumerLag = createLambda({
      id: "checkConsumerLag",
      role: sharedLambdaRole,
      useVpc: true,
    });
    const deleteTriggers = createLambda({
      id: "deleteTriggers",
      role: sharedLambdaRole,
    });
    const deleteIndex = createLambda({
      id: "deleteIndex",
      role: sharedLambdaRole,
      useVpc: true,
    });
    const setupIndex = createLambda({
      id: "setupIndex",
      role: sharedLambdaRole,
      useVpc: true,
    });

    const notifyState = (name: string, success: boolean) =>
      new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, name, {
        lambdaFunction: cfnNotify,
        outputPath: "$.Payload",
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          "Context.$": "$$",
          Success: success,
        }),
      });
    const failureState = new cdk.aws_stepfunctions.Fail(this, "FailureState");
    const notifyOfFailureStep = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "NotifyOfFailure",
      {
        lambdaFunction: cfnNotify,
        outputPath: "$.Payload",
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          "Context.$": "$$",
          Success: false,
        }),
      },
    ).next(failureState);

    const checkSeaDataProgressTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "CheckSeaDataProgress",
      {
        lambdaFunction: checkConsumerLag,
        outputPath: "$.Payload",
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          brokerString,
          triggers: [
            {
              function: lambdaFunctions.sinkMain.functionName,
              topics: ["aws.seatool.ksql.onemac.three.agg.State_Plan"],
            },
          ],
        }),
      },
    ).addCatch(notifyOfFailureStep, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const checkDataProgressTask = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "CheckDataProgress",
      {
        lambdaFunction: checkConsumerLag,
        outputPath: "$.Payload",
        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
          brokerString,
          triggers: [
            {
              function: lambdaFunctions.sinkMain.functionName,
              topics: [
                "aws.onemac.migration.cdc",
                `${topicNamespace}aws.onemac.migration.cdc`,
                "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan",
              ],
            },
            {
              function: lambdaFunctions.sinkChangelog.functionName,
              topics: ["aws.onemac.migration.cdc", `${topicNamespace}aws.onemac.migration.cdc`],
            },
            {
              function: lambdaFunctions.sinkTypes.functionName,
              topics: ["aws.seatool.debezium.cdc.SEA.dbo.SPA_Type"],
              batchSize: 10000,
            },
            {
              function: lambdaFunctions.sinkSubtypes.functionName,
              topics: ["aws.seatool.debezium.cdc.SEA.dbo.Type"],
              batchSize: 10000,
            },
            {
              function: lambdaFunctions.sinkCpocs.functionName,
              topics: ["aws.seatool.debezium.cdc.SEA.dbo.Officers"],
            },
          ],
        }),
      },
    ).addCatch(notifyOfFailureStep, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const definition = new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "DeleteAllTriggers", {
      lambdaFunction: deleteTriggers,
      outputPath: "$.Payload",
      payload: cdk.aws_stepfunctions.TaskInput.fromObject({
        "Context.$": "$$",
        functions: Object.values(lambdaFunctions).map((fn) => fn.functionName),
      }),
    })
      .addCatch(notifyOfFailureStep, {
        errors: ["States.ALL"],
        resultPath: "$.error",
      })
      .next(
        new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "DeleteIndex", {
          lambdaFunction: deleteIndex,
          outputPath: "$.Payload",
          payload: cdk.aws_stepfunctions.TaskInput.fromObject({
            "Context.$": "$$",
            osDomain: `https://${openSearchDomainEndpoint}`,
            indexNamespace,
          }),
        }).addCatch(notifyOfFailureStep, {
          errors: ["States.ALL"],
          resultPath: "$.error",
        }),
      )
      .next(
        new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "SetupIndex", {
          lambdaFunction: setupIndex,
          outputPath: "$.Payload",
          payload: cdk.aws_stepfunctions.TaskInput.fromObject({
            "Context.$": "$$",
            osDomain: `https://${openSearchDomainEndpoint}`,
            indexNamespace,
          }),
        }).addCatch(notifyOfFailureStep, {
          errors: ["States.ALL"],
          resultPath: "$.error",
        }),
      )
      .next(
        new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "StartIndexingSeaData", {
          lambdaFunction: createTriggers,
          outputPath: "$.Payload",
          payload: cdk.aws_stepfunctions.TaskInput.fromObject({
            "Context.$": "$$",
            osDomain: `https://${openSearchDomainEndpoint}`,
            brokerString,
            securityGroup: lambdaSecurityGroup.securityGroupId,
            consumerGroupPrefix,
            subnets: privateSubnets.map((subnet) => subnet.subnetId),
            triggers: [
              {
                function: lambdaFunctions.sinkMain.functionName,
                topics: ["aws.seatool.ksql.onemac.three.agg.State_Plan"],
              },
            ],
          }),
        }).addCatch(notifyOfFailureStep, {
          errors: ["States.ALL"],
          resultPath: "$.error",
        }),
      )
      .next(checkSeaDataProgressTask)
      .next(
        new cdk.aws_stepfunctions.Choice(this, "IsSeaDataReady")
          .when(
            cdk.aws_stepfunctions.Condition.booleanEquals("$.ready", true),
            new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "DeleteSeaDataTriggers", {
              lambdaFunction: deleteTriggers,
              outputPath: "$.Payload",
              payload: cdk.aws_stepfunctions.TaskInput.fromObject({
                "Context.$": "$$",
                functions: [lambdaFunctions["sinkMain"].functionName],
              }),
            })
              .addCatch(notifyOfFailureStep, {
                errors: ["States.ALL"],
                resultPath: "$.error",
              })
              .next(
                new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "StartIndexingData", {
                  lambdaFunction: createTriggers,
                  outputPath: "$.Payload",
                  payload: cdk.aws_stepfunctions.TaskInput.fromObject({
                    "Context.$": "$$",
                    osDomain: `https://${openSearchDomainEndpoint}`,
                    brokerString,
                    securityGroup: lambdaSecurityGroup.securityGroupId,
                    consumerGroupPrefix,
                    subnets: privateSubnets.map((subnet) => subnet.subnetId),
                    triggers: [
                      {
                        function: lambdaFunctions.sinkMain.functionName,
                        topics: [
                          "aws.onemac.migration.cdc",
                          `${topicNamespace}aws.onemac.migration.cdc`,
                          "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan",
                        ],
                      },
                      {
                        function: lambdaFunctions.sinkChangelog.functionName,
                        topics: [
                          "aws.onemac.migration.cdc",
                          `${topicNamespace}aws.onemac.migration.cdc`,
                        ],
                      },
                      {
                        function: lambdaFunctions.sinkTypes.functionName,
                        topics: ["aws.seatool.debezium.cdc.SEA.dbo.SPA_Type"],
                        batchSize: 10000,
                      },
                      {
                        function: lambdaFunctions.sinkSubtypes.functionName,
                        topics: ["aws.seatool.debezium.cdc.SEA.dbo.Type"],
                        batchSize: 10000,
                      },
                      {
                        function: lambdaFunctions.sinkCpocs.functionName,
                        topics: ["aws.seatool.debezium.cdc.SEA.dbo.Officers"],
                      },
                    ],
                  }),
                }).addCatch(notifyOfFailureStep, {
                  errors: ["States.ALL"],
                  resultPath: "$.error",
                }),
              )
              .next(checkDataProgressTask)
              .next(
                new cdk.aws_stepfunctions.Choice(this, "IsDataReady")
                  .when(
                    cdk.aws_stepfunctions.Condition.booleanEquals("$.ready", true),
                    // here we conditionally slap seatoolbackon
                    new cdk.aws_stepfunctions_tasks.LambdaInvoke(
                      this,
                      "StartConditionallyIndexingSeaData",
                      {
                        lambdaFunction: createTriggers,
                        outputPath: "$.Payload",
                        payload: cdk.aws_stepfunctions.TaskInput.fromObject({
                          "Context.$": "$$",
                          osDomain: `https://${openSearchDomainEndpoint}`,
                          brokerString,
                          securityGroup: lambdaSecurityGroup.securityGroupId,
                          consumerGroupPrefix,
                          subnets: privateSubnets.map((subnet) => subnet.subnetId),
                          triggers: [
                            {
                              function: lambdaFunctions.sinkMain.functionName,
                              topics: ["aws.seatool.ksql.onemac.three.agg.State_Plan"],
                            },
                          ],
                        }),
                      },
                    )
                      .addCatch(notifyOfFailureStep, {
                        errors: ["States.ALL"],
                        resultPath: "$.error",
                      })
                      .next(notifyState("NotifyOfSuccess", true))
                      .next(new cdk.aws_stepfunctions.Succeed(this, "SuccessState")),
                  )
                  .when(
                    cdk.aws_stepfunctions.Condition.booleanEquals("$.ready", false),
                    new cdk.aws_stepfunctions.Wait(this, "WaitForData", {
                      time: cdk.aws_stepfunctions.WaitTime.duration(cdk.Duration.seconds(3)),
                    }).next(checkDataProgressTask),
                  ),
              ),
          )
          .when(
            cdk.aws_stepfunctions.Condition.booleanEquals("$.ready", false),
            new cdk.aws_stepfunctions.Wait(this, "WaitForSeaData", {
              time: cdk.aws_stepfunctions.WaitTime.duration(cdk.Duration.seconds(3)),
            }).next(checkSeaDataProgressTask),
          ),
      );

    const stateMachineLogGroup = new cdk.aws_logs.LogGroup(this, "StateMachineLogGroup", {
      logGroupName: `/aws/vendedlogs/states/${project}-${stage}-${stack}-reindex`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const reindexStateMachine = new cdk.aws_stepfunctions.StateMachine(
      this,
      "ReindexDataStateMachine",
      {
        definition,
        role: stateMachineRole,
        stateMachineName: `${project}-${stage}-${stack}-reindex`,
        logs: {
          destination: stateMachineLogGroup,
          level: cdk.aws_stepfunctions.LogLevel.ALL,
          includeExecutionData: true,
        },
      },
    );

    const runReindexLogGroup = new cdk.aws_logs.LogGroup(this, `runReindexLogGroup`, {
      logGroupName: `/aws/lambda/${project}-${stage}-${stack}-runReindex`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const runReindexLambda = new NodejsFunction(this, "runReindexLambdaFunction", {
      functionName: `${project}-${stage}-${stack}-runReindex`,
      entry: join(__dirname, "../lambda/runReindex.ts"),
      handler: "handler",
      depsLockFilePath: join(__dirname, "../../bun.lockb"),
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      role: new cdk.aws_iam.Role(this, "RunReindexLambdaExecutionRole", {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
        ],
        inlinePolicies: {
          LambdaAssumeRolePolicy: new cdk.aws_iam.PolicyDocument({
            statements: [
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
                actions: ["states:StartExecution"],
                resources: [
                  `arn:aws:states:${this.region}:${this.account}:stateMachine:${project}-${stage}-${stack}-reindex`,
                ],
              }),
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.DENY,
                actions: ["logs:CreateLogGroup"],
                resources: ["*"],
              }),
            ],
          }),
        },
      }),
      logGroup: runReindexLogGroup,
      bundling: commonBundlingOptions,
    });

    const runReindexProviderProvider = new cdk.custom_resources.Provider(
      this,
      "RunReindexProvider",
      {
        onEventHandler: runReindexLambda,
      },
    );

    new cdk.CustomResource(this, "RunReindex", {
      serviceToken: runReindexProviderProvider.serviceToken,
      properties: {
        stateMachine: reindexStateMachine.stateMachineArn,
      },
    });

    if (!usingSharedOpenSearch) {
      reindexStateMachine.node.addDependency(this.mapRoleCustomResource);
    }

    const deleteIndexOnStackDeleteCustomResourceLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "deleteIndexOnStackDeleteCustomResourceLogGroup",
      {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-deleteIndexOnDeleteCustomResource`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );
    const deleteIndexOnStackDeleteCustomResource = new cr.AwsCustomResource(
      this,
      "DeleteIndexOnStackDeleteCustomResource",
      {
        onDelete: {
          service: "Lambda",
          action: "invoke",
          parameters: {
            FunctionName: deleteIndex.functionName,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({
              RequestType: "Delete",
              osDomain: `https://${openSearchDomainEndpoint}`,
              indexNamespace,
            }),
          },
          physicalResourceId: cr.PhysicalResourceId.of("delete-index-on-stack-deletes"),
        },
        logGroup: deleteIndexOnStackDeleteCustomResourceLogGroup,
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new cdk.aws_iam.PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: [deleteIndex.functionArn],
          }),
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.DENY,
            actions: ["logs:CreateLogGroup"],
            resources: ["*"],
          }),
        ]),
      },
    );
    const deleteIndexOnDeleteCustomResourcePolicy =
      deleteIndexOnStackDeleteCustomResource.node.findChild("CustomResourcePolicy");
    deleteIndexOnStackDeleteCustomResource.node.addDependency(
      deleteIndexOnDeleteCustomResourcePolicy,
    );
    deleteIndexOnStackDeleteCustomResourceLogGroup.node.addDependency(
      deleteIndexOnDeleteCustomResourcePolicy,
    );

    const deleteTriggersOnStackDeleteCustomResourceLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "deleteTriggersOnStackDeleteCustomResourceLogGroup",
      {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-deleteTriggersOnDeleteCustomResource`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );
    const deleteTriggersOnStackDeleteCustomResource = new cr.AwsCustomResource(
      this,
      "DeleteTriggersOnStackDeleteCustomResource",
      {
        onDelete: {
          service: "Lambda",
          action: "invoke",
          parameters: {
            FunctionName: deleteTriggers.functionName,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({
              RequestType: "Delete",
              functions: Object.values(lambdaFunctions).map((fn) => fn.functionName),
            }),
          },
          physicalResourceId: cr.PhysicalResourceId.of("delete-triggers-on-stack-deletes"),
        },
        logGroup: deleteTriggersOnStackDeleteCustomResourceLogGroup,
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new cdk.aws_iam.PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: [deleteTriggers.functionArn],
          }),
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.DENY,
            actions: ["logs:CreateLogGroup"],
            resources: ["*"],
          }),
        ]),
      },
    );
    const deleteTriggersOnDeleteCustomResourcePolicy =
      deleteTriggersOnStackDeleteCustomResource.node.findChild("CustomResourcePolicy");
    deleteTriggersOnStackDeleteCustomResource.node.addDependency(
      deleteTriggersOnDeleteCustomResourcePolicy,
    );
    deleteTriggersOnStackDeleteCustomResourceLogGroup.node.addDependency(
      deleteTriggersOnDeleteCustomResourcePolicy,
    );
    // Ensures the triggers will be deleted before the indexes on stack delete
    deleteTriggersOnStackDeleteCustomResource.node.addDependency(
      deleteIndexOnStackDeleteCustomResource,
    );

    return { openSearchDomainEndpoint, openSearchDomainArn };
  }
}
