import { readFileSync } from "fs";
import { join } from "path";

import {
  CustomResource,
  Duration,
  NestedStack,
  NestedStackProps,
  RemovalPolicy,
  Stack,
} from "aws-cdk-lib";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
  Provider,
} from "aws-cdk-lib/custom-resources";
import {
  IVpc,
  ISecurityGroup,
  ISubnet,
  SecurityGroup,
  Peer,
  Port,
} from "aws-cdk-lib/aws-ec2";
import {
  AccountPrincipal,
  ArnPrincipal,
  Effect,
  FederatedPrincipal,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Alias, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import {
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  UserPoolClient,
  UserPoolDomain,
  UserPool,
} from "aws-cdk-lib/aws-cognito";
import { CfnDomain } from "aws-cdk-lib/aws-opensearchservice";
import {
  Choice,
  Condition,
  Fail,
  LogLevel,
  StateMachine,
  Succeed,
  TaskInput,
  Wait,
  WaitTime,
} from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";

import { Construct } from "constructs";

import { CleanupKafka, CreateTopics, ManageUsers } from "local-constructs";
import path = require("path");

interface DataStackProps extends NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpc: IVpc;
  privateSubnets: ISubnet[];
  brokerString: string;
  lambdaSecurityGroup: ISecurityGroup;
  topicNamespace: string;
  indexNamespace: string;
  sharedOpenSearchDomainEndpoint: string;
  sharedOpenSearchDomainArn: string;
  devPasswordArn: string;
}

export class DataStack extends NestedStack {
  public readonly openSearchDomainArn: string;
  public readonly openSearchDomainEndpoint: string;
  private mapRoleCustomResource: CustomResource;

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

    const usingSharedOpenSearch =
      sharedOpenSearchDomainEndpoint && sharedOpenSearchDomainArn;

    if (usingSharedOpenSearch) {
      openSearchDomainEndpoint = sharedOpenSearchDomainEndpoint;
      openSearchDomainArn = sharedOpenSearchDomainArn;
    } else {
      const userPool = new UserPool(this, "UserPool", {
        userPoolName: `${project}-${stage}-search`,
        removalPolicy: RemovalPolicy.DESTROY,
        selfSignUpEnabled: false,
        signInAliases: { email: true },
        autoVerify: { email: true },
        standardAttributes: { email: { required: true, mutable: true } },
      });

      const userPoolDomain = new UserPoolDomain(this, "UserPoolDomain", {
        userPool,
        cognitoDomain: {
          domainPrefix: `${project}-${stage}-search`,
        },
      });

      const userPoolClient = new UserPoolClient(this, "UserPoolClient", {
        userPool,
        authFlows: { adminUserPassword: true },
      });

      const identityPool = new CfnIdentityPool(this, "IdentityPool", {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.userPoolClientId,
            providerName: userPool.userPoolProviderName,
          },
        ],
      });

      const cognitoAuthRole = new Role(this, "CognitoAuthRole", {
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
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName("AmazonCognitoReadOnly"),
        ],
      });

      cognitoAuthRole.assumeRolePolicy?.addStatements(
        new PolicyStatement({
          effect: Effect.ALLOW,
          principals: [new ServicePrincipal("es.amazonaws.com")],
          actions: ["sts:AssumeRole"],
        }),
      );

      new CfnIdentityPoolRoleAttachment(this, "IdentityPoolRoleAttachment", {
        identityPoolId: identityPool.ref,
        roles: { authenticated: cognitoAuthRole.roleArn },
      });

      const openSearchSecurityGroup = new SecurityGroup(
        this,
        "OpenSearchSecurityGroup",
        {
          vpc,
          description: "Security group for OpenSearch",
        },
      );
      openSearchSecurityGroup.addIngressRule(
        Peer.ipv4("10.0.0.0/8"),
        Port.tcp(443),
        "Allow HTTPS access from VPC",
      );

      const openSearchRole = new Role(this, "OpenSearchRole", {
        assumedBy: new ServicePrincipal("es.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonOpenSearchServiceCognitoAccess",
          ),
        ],
      });

      const openSearchMasterRole = new Role(this, "OpenSearchMasterRole", {
        assumedBy: new ServicePrincipal("es.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonOpenSearchServiceFullAccess",
          ),
        ],
      });

      openSearchMasterRole.assumeRolePolicy?.addStatements(
        new PolicyStatement({
          effect: Effect.ALLOW,
          principals: [new AccountPrincipal(Stack.of(this).account)],
          actions: ["sts:AssumeRole"],
        }),
      );

      const openSearchDomain = new CfnDomain(this, "OpenSearchDomain", {
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
          tlsSecurityPolicy: "Policy-Min-TLS-1-2-2019-07",
        },
        cognitoOptions: {
          enabled: true,
          identityPoolId: identityPool.ref,
          roleArn: openSearchRole.roleArn,
          userPoolId: userPool.userPoolId,
        },
        accessPolicies: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["es:*"],
              principals: [new ArnPrincipal(cognitoAuthRole.roleArn)],
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
          subnetIds: privateSubnets
            .slice(0, 3)
            .map((subnet) => subnet.subnetId),
        },
      });
      new ManageUsers(
        this,
        "ManageUsers",
        userPool,
        JSON.parse(
          readFileSync(
            join(__dirname, "../test/users/kibana-users.json"),
            "utf8",
          ),
        ),
        devPasswordArn,
      );

      const mapRole = new NodejsFunction(this, "MapRoleLambdaFunction", {
        functionName: `${project}-${stage}-${stack}-mapRole`,
        entry: join(__dirname, "lambda/mapRole.ts"),
        handler: "handler",
        depsLockFilePath: join(__dirname, "../bun.lockb"),
        runtime: Runtime.NODEJS_18_X,
        role: new Role(this, "MapRoleLambdaExecutionRole", {
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
            LambdaAssumeRolePolicy: new PolicyDocument({
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
                  resources: [`${openSearchDomain.attrArn}/*`],
                }),
                new PolicyStatement({
                  effect: Effect.ALLOW,
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
          region: this.region,
          osDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
        },
        bundling: {
          minify: true,
          sourceMap: true,
        },
      });

      const customResourceProvider = new Provider(
        this,
        "CustomResourceProvider",
        {
          onEventHandler: mapRole,
        },
      );

      this.mapRoleCustomResource = new CustomResource(this, "MapRole", {
        serviceToken: customResourceProvider.serviceToken,
        properties: {
          OsDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
          IamRoleName: `arn:aws:iam::${this.account}:role/*`,
          MasterRoleToAssume: openSearchMasterRole.roleArn,
          OsRoleName: "all_access",
        },
      });

      openSearchDomainEndpoint = openSearchDomain.attrDomainEndpoint;
      openSearchDomainArn = openSearchDomain.attrArn;
    }

    new CreateTopics(this, "createTopics", {
      brokerString,
      privateSubnets,
      securityGroups: [lambdaSecurityGroup],
      topics: [
        {
          topic: `${topicNamespace}aws.onemac.migration.cdc`,
        },
      ],
      vpc,
    });

    if (isDev) {
      new CleanupKafka(this, "cleanupKafka", {
        vpc,
        privateSubnets,
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
      timeout = Duration.minutes(5),
      memorySize = 1024,
      provisionedConcurrency = 0,
    }: {
      id: string;
      entry?: string;
      role: Role;
      useVpc?: boolean;
      environment?: { [key: string]: string };
      timeout?: Duration;
      memorySize?: number;
      provisionedConcurrency?: number;
    }) => {
      const logGroup = new LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-${id}`,
        removalPolicy: RemovalPolicy.DESTROY,
      });
      const fn = new NodejsFunction(this, id, {
        functionName: `${project}-${stage}-${stack}-${id}`,
        depsLockFilePath: join(__dirname, "../bun.lockb"),
        entry: join(__dirname, `lambda/${entry}`),
        handler: "handler",
        runtime: Runtime.NODEJS_18_X,
        role,
        memorySize,
        vpc: useVpc ? vpc : undefined,
        vpcSubnets: useVpc ? { subnets: privateSubnets } : undefined,
        securityGroups: useVpc ? [lambdaSecurityGroup] : undefined,
        environment,
        logGroup,
        timeout,
        bundling: {
          minify: true,
          sourceMap: true,
        },
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

    const sharedLambdaRole = new Role(this, "SharedLambdaExecutionRole", {
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
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["ec2:DescribeSecurityGroups", "ec2:DescribeVpcs"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    const functionConfigs = {
      sinkChangelog: { provisionedConcurrency: 2 },
      sinkInsights: { provisionedConcurrency: 0 },
      sinkLegacyInsights: { provisionedConcurrency: 0 },
      sinkMain: { provisionedConcurrency: 2 },
      sinkSubtypes: { provisionedConcurrency: 0 },
      sinkTypes: { provisionedConcurrency: 0 },
      sinkCpocs: { provisionedConcurrency: 0 },
    };

    const lambdaFunctions = Object.entries(functionConfigs).reduce(
      (acc, [name, config]) => {
        acc[name] = createLambda({
          id: name,
          role: sharedLambdaRole,
          useVpc: true,
          environment: {
            osDomain: `https://${openSearchDomainEndpoint}`,
            indexNamespace,
          },
          provisionedConcurrency: !props.isDev
            ? config.provisionedConcurrency
            : 0,
        });
        return acc;
      },
      {} as { [key: string]: NodejsFunction },
    );

    const stateMachineRole = new Role(this, "StateMachineRole", {
      assumedBy: new ServicePrincipal("states.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
        ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
      ],
      inlinePolicies: {
        StateMachinePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["lambda:InvokeFunction"],
              resources: [
                `arn:aws:lambda:${this.region}:${this.account}:function:${project}-${stage}-${stack}-*`,
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
      timeout: Duration.minutes(15),
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
      new LambdaInvoke(this, name, {
        lambdaFunction: cfnNotify,
        outputPath: "$.Payload",
        payload: TaskInput.fromObject({
          "Context.$": "$$",
          Success: success,
        }),
      });
    const failureState = new Fail(this, "FailureState");
    const notifyOfFailureStep = new LambdaInvoke(this, "NotifyOfFailure", {
      lambdaFunction: cfnNotify,
      outputPath: "$.Payload",
      payload: TaskInput.fromObject({
        "Context.$": "$$",
        Success: false,
      }),
    }).next(failureState);

    const checkDataProgressTask = new LambdaInvoke(this, "CheckDataProgress", {
      lambdaFunction: checkConsumerLag,
      outputPath: "$.Payload",
      payload: TaskInput.fromObject({
        brokerString,
        triggers: [
          {
            function: lambdaFunctions.sinkMain.functionName,
            topics: [
              "aws.seatool.ksql.onemac.agg.State_Plan",
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
    });

    const definition = new LambdaInvoke(this, "DeleteAllTriggers", {
      lambdaFunction: deleteTriggers,
      outputPath: "$.Payload",
      payload: TaskInput.fromObject({
        "Context.$": "$$",
        functions: Object.values(lambdaFunctions).map((fn) => fn.functionName),
      }),
    })
      .addCatch(notifyOfFailureStep, {
        errors: ["States.ALL"],
        resultPath: "$.error",
      })
      .next(
        new LambdaInvoke(this, "DeleteIndex", {
          lambdaFunction: deleteIndex,
          outputPath: "$.Payload",
          payload: TaskInput.fromObject({
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
        new LambdaInvoke(this, "SetupIndex", {
          lambdaFunction: setupIndex,
          outputPath: "$.Payload",
          payload: TaskInput.fromObject({
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
        new LambdaInvoke(this, "StartIndexingData", {
          lambdaFunction: createTriggers,
          outputPath: "$.Payload",
          payload: TaskInput.fromObject({
            "Context.$": "$$",
            osDomain: `https://${openSearchDomainEndpoint}`,
            brokerString,
            securityGroup: lambdaSecurityGroup.securityGroupId,
            consumerGroupPrefix,
            subnets: privateSubnets
              .slice(0, 3)
              .map((subnet) => subnet.subnetId),
            triggers: [
              {
                function: lambdaFunctions.sinkMain.functionName,
                topics: [
                  "aws.seatool.ksql.onemac.agg.State_Plan",
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
        new Choice(this, "IsDataReady")
          .when(
            Condition.booleanEquals("$.ready", true),
            new LambdaInvoke(this, "StartIndexingInsights", {
              lambdaFunction: createTriggers,
              outputPath: "$.Payload",
              payload: TaskInput.fromObject({
                "Context.$": "$$",
                osDomain: `https://${openSearchDomainEndpoint}`,
                brokerString,
                securityGroup: lambdaSecurityGroup.securityGroupId,
                consumerGroupPrefix,
                subnets: privateSubnets
                  .slice(0, 3)
                  .map((subnet) => subnet.subnetId),
                triggers: [
                  {
                    function: lambdaFunctions.sinkInsights.functionName,
                    topics: ["aws.seatool.ksql.onemac.agg.State_Plan"],
                  },
                  {
                    function: lambdaFunctions.sinkLegacyInsights.functionName,
                    topics: [
                      "aws.onemac.migration.cdc",
                      `${topicNamespace}aws.onemac.migration.cdc`,
                    ],
                  },
                ],
              }),
            })
              .addCatch(notifyOfFailureStep, {
                errors: ["States.ALL"],
                resultPath: "$.error",
              })
              .next(notifyState("NotifyOfSuccess", true))
              .next(new Succeed(this, "SuccessState")),
          )
          .when(
            Condition.booleanEquals("$.ready", false),
            new Wait(this, "WaitForData", {
              time: WaitTime.duration(Duration.seconds(3)),
            }).next(checkDataProgressTask),
          ),
      );

    const stateMachineLogGroup = new LogGroup(this, "StateMachineLogGroup", {
      logGroupName: `/aws/vendedlogs/states/${project}-${stage}-${stack}-reindex`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const reindexStateMachine = new StateMachine(
      this,
      "ReindexDataStateMachine",
      {
        definition,
        role: stateMachineRole,
        stateMachineName: `${project}-${stage}-${stack}-reindex`,
        logs: {
          destination: stateMachineLogGroup,
          level: LogLevel.ALL,
          includeExecutionData: true,
        },
      },
    );

    const runReindexLogGroup = new LogGroup(this, `runReindexLogGroup`, {
      logGroupName: `/aws/lambda/${project}-${stage}-${stack}-runReindex`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const runReindexLambda = new NodejsFunction(
      this,
      "runReindexLambdaFunction",
      {
        functionName: `${project}-${stage}-${stack}-runReindex`,
        entry: join(__dirname, "lambda/runReindex.ts"),
        handler: "handler",
        depsLockFilePath: join(__dirname, "../bun.lockb"),
        runtime: Runtime.NODEJS_18_X,
        timeout: Duration.minutes(5),
        role: new Role(this, "RunReindexLambdaExecutionRole", {
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
                  effect: Effect.ALLOW,
                  actions: ["states:StartExecution"],
                  resources: [
                    `arn:aws:states:${this.region}:${this.account}:stateMachine:${project}-${stage}-${stack}-reindex`,
                  ],
                }),
                new PolicyStatement({
                  effect: Effect.DENY,
                  actions: ["logs:CreateLogGroup"],
                  resources: ["*"],
                }),
              ],
            }),
          },
        }),
        logGroup: runReindexLogGroup,
        bundling: {
          minify: true,
          sourceMap: true,
        },
      },
    );

    const runReindexProviderProvider = new Provider(
      this,
      "RunReindexProvider",
      {
        onEventHandler: runReindexLambda,
      },
    );

    const runReindexCustomResource = new CustomResource(this, "RunReindex", {
      serviceToken: runReindexProviderProvider.serviceToken,
      properties: {
        stateMachine: reindexStateMachine.stateMachineArn,
      },
    });

    if (!usingSharedOpenSearch) {
      reindexStateMachine.node.addDependency(this.mapRoleCustomResource);
    }

    const deleteTriggersOnStackDeleteCustomResourceLogGroup = new LogGroup(
      this,
      "deleteTriggersOnStackDeleteCustomResourceLogGroup",
      {
        logGroupName: `/aws/lambda/${project}-${stage}-${stack}-deleteTriggersOnDeleteCustomResource`,
        removalPolicy: RemovalPolicy.DESTROY,
      },
    );
    const deleteTriggersOnStackDeleteCustomResource = new AwsCustomResource(
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
              functions: Object.values(lambdaFunctions).map(
                (fn) => fn.functionName,
              ),
            }),
          },
          physicalResourceId: PhysicalResourceId.of(
            "delete-triggers-on-stack-deletes",
          ),
        },
        logGroup: deleteTriggersOnStackDeleteCustomResourceLogGroup,
        policy: AwsCustomResourcePolicy.fromStatements([
          new PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: [deleteTriggers.functionArn],
          }),
          new PolicyStatement({
            effect: Effect.DENY,
            actions: ["logs:CreateLogGroup"],
            resources: ["*"],
          }),
        ]),
      },
    );
    const deleteTriggersOnDeleteCustomResourcePolicy =
      deleteTriggersOnStackDeleteCustomResource.node.findChild(
        "CustomResourcePolicy",
      );
    deleteTriggersOnStackDeleteCustomResource.node.addDependency(
      deleteTriggersOnDeleteCustomResourcePolicy,
    );
    deleteTriggersOnStackDeleteCustomResourceLogGroup.node.addDependency(
      deleteTriggersOnDeleteCustomResourcePolicy,
    );

    return { openSearchDomainEndpoint, openSearchDomainArn };
  }
}
