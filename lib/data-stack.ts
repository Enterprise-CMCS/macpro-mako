import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as opensearch from "aws-cdk-lib/aws-opensearchservice";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cr from "aws-cdk-lib/custom-resources";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as fs from "fs";
import * as logs from "aws-cdk-lib/aws-logs";
import { ManageUsers } from "./manage-users-construct";

interface DataStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  vpcInfo: {
    id: string;
    privateSubnets: string[];
  };
  brokerString: string;
  lambdaSecurityGroup: ec2.SecurityGroup;
  topicNamespace: string;
}

export class DataStack extends cdk.NestedStack {
  public readonly openSearchDomain: opensearch.CfnDomain;
  public readonly openSearchDomainEndpoint: string;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);
    const resources = this.initializeResources(props);
    this.openSearchDomain = resources.openSearchDomain;
    this.openSearchDomainEndpoint = `https://${this.openSearchDomain.attrDomainEndpoint}`;
  }

  private initializeResources(props: DataStackProps): {
    openSearchDomain: opensearch.CfnDomain;
  } {
    const { project, stage, stack, isDev } = props;
    const { vpcInfo, brokerString, lambdaSecurityGroup, topicNamespace } =
      props;
    const privateSubnets = vpcInfo.privateSubnets.map((subnetId: string) =>
      ec2.Subnet.fromSubnetId(this, `Subnet${subnetId}`, subnetId),
    );
    const vpc = ec2.Vpc.fromLookup(this, "MyVpc", {
      vpcId: vpcInfo.id,
    });

    const consumerGroupPrefix = `--${project}--${stage}--`;

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `${project}-${stage}-search`,
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolDomain = new cognito.UserPoolDomain(this, "UserPoolDomain", {
      userPool,
      cognitoDomain: {
        domainPrefix: `${project}-${stage}-search`,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      authFlows: { adminUserPassword: true },
    });

    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const cognitoAuthRole = new iam.Role(this, "CognitoAuthRole", {
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
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonCognitoReadOnly"),
      ],
    });

    cognitoAuthRole.assumeRolePolicy?.addStatements(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("es.amazonaws.com")],
        actions: ["sts:AssumeRole"],
      }),
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPoolRoleAttachment",
      {
        identityPoolId: identityPool.ref,
        roles: {
          authenticated: cognitoAuthRole.roleArn,
        },
      },
    );

    const openSearchSecurityGroup = new ec2.SecurityGroup(
      this,
      "OpenSearchSecurityGroup",
      {
        vpc,
        description: "Security group for OpenSearch",
      },
    );
    openSearchSecurityGroup.addIngressRule(
      ec2.Peer.ipv4("10.0.0.0/8"),
      ec2.Port.tcp(443),
      "Allow HTTPS access from VPC",
    );
    openSearchSecurityGroup.addEgressRule(
      ec2.Peer.ipv4("127.0.0.1/32"),
      ec2.Port.tcp(443),
      "Allow HTTPS access to localhost",
    );

    const openSearchRole = new iam.Role(this, "OpenSearchRole", {
      assumedBy: new iam.ServicePrincipal("es.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonOpenSearchServiceCognitoAccess",
        ),
      ],
    });

    const openSearchMasterRole = new iam.Role(this, "OpenSearchMasterRole", {
      assumedBy: new iam.ServicePrincipal("es.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonOpenSearchServiceFullAccess",
        ),
      ],
    });

    openSearchMasterRole.assumeRolePolicy?.addStatements(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AccountPrincipal(cdk.Stack.of(this).account)],
        actions: ["sts:AssumeRole"],
      }),
    );

    // OpenSearch Domain
    const openSearchDomain = new opensearch.CfnDomain(
      this,
      "OpenSearchDomain",
      {
        ebsOptions: {
          ebsEnabled: true,
          volumeType: "gp3",
          volumeSize: 20,
        },
        clusterConfig: {
          instanceType: "r5.large.search",
          instanceCount: isDev ? 1 : 3,
          dedicatedMasterEnabled: false,
          zoneAwarenessEnabled: !isDev,
          ...(isDev
            ? {}
            : { zoneAwarenessConfig: { availabilityZoneCount: 3 } }),
        },
        encryptionAtRestOptions: {
          enabled: true,
        },
        nodeToNodeEncryptionOptions: {
          enabled: true,
        },
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
        accessPolicies: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["es:*"],
              principals: [new iam.ArnPrincipal(cognitoAuthRole.roleArn)],
              resources: ["*"],
            }),
          ],
        }),
        advancedSecurityOptions: {
          enabled: true,
          internalUserDatabaseEnabled: false,
          masterUserOptions: {
            masterUserArn: openSearchMasterRole.roleArn,
          },
        },
        vpcOptions: {
          securityGroupIds: [openSearchSecurityGroup.securityGroupId],
          subnetIds: isDev
            ? [vpcInfo.privateSubnets[0]]
            : vpcInfo.privateSubnets,
        },
      },
    );

    const mapRole = new NodejsFunction(this, "MapRoleLambdaFunction", {
      functionName: `${project}-${stage}-mapRole`,
      entry: path.join(__dirname, "lambda/mapRole.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      role: new iam.Role(this, "MapRoleLambdaExecutionRole", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
        ],
        inlinePolicies: {
          LambdaAssumeRolePolicy: new iam.PolicyDocument({
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
                resources: [`${openSearchDomain.attrArn}/*`],
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
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
    });

    const customResourceProvider = new cr.Provider(
      this,
      "CustomResourceProvider",
      {
        onEventHandler: mapRole,
      },
    );

    const mapRoleCustomResource = new cdk.CustomResource(this, "MapRole", {
      serviceToken: customResourceProvider.serviceToken,
      properties: {
        OsDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
        IamRoleName: `arn:aws:iam::${this.account}:role/*`,
        MasterRoleToAssume: openSearchMasterRole.roleArn,
        OsRoleName: "all_access",
      },
    });

    const manageUsers = new ManageUsers(
      this,
      userPool,
      project,
      stage,
      JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "other/kibana-users.json"),
          "utf8",
        ),
      ),
    );

    const createTopics = new NodejsFunction(
      this,
      "CreateTopicsLambdaFunction",
      {
        functionName: `${project}-${stage}-createTopics`,
        entry: path.join(__dirname, "lambda/createTopics.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.minutes(5),
        role: new iam.Role(this, "CreateTopicsLambdaExecutionRole", {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole",
            ),
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaVPCAccessExecutionRole",
            ),
          ],
        }),
        vpc,
        vpcSubnets: {
          subnets: privateSubnets,
        },
        securityGroups: [lambdaSecurityGroup],
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
          externalModules: ["aws-sdk"],
        },
      },
    );

    const createTopicsCustomResourceProvider = new cr.Provider(
      this,
      "CreateTopicsCustomResourceProvider",
      {
        onEventHandler: createTopics,
      },
    );

    new cdk.CustomResource(this, "CreateTopics", {
      serviceToken: createTopicsCustomResourceProvider.serviceToken,
      properties: {
        topicNamespace,
        brokerString: brokerString,
        topicsToCreate: [
          {
            topic: `${topicNamespace}aws.onemac.migration.cdc`,
          },
        ],
      },
    });

    const checkConsumerLag = new NodejsFunction(
      this,
      "CheckConsumerLagLambdaFunctiopn",
      {
        functionName: `${project}-${stage}-checkConsumerLag`,
        entry: path.join(__dirname, "lambda/checkConsumerLag.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.minutes(15),
        role: new iam.Role(this, "CheckConsumerLagLambdaExecutionRole", {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole",
            ),
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaVPCAccessExecutionRole",
            ),
          ],
          inlinePolicies: {
            LambdaAssumeRolePolicy: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
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
              ],
            }),
          },
        }),
        vpc,
        vpcSubnets: {
          subnets: privateSubnets,
        },
        securityGroups: [lambdaSecurityGroup],
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
          externalModules: ["aws-sdk"],
        },
      },
    );

    const cfnNotify = new NodejsFunction(this, "CfnNotifyLambdaFunctiopn", {
      functionName: `${project}-${stage}-cfnNotify`,
      entry: path.join(__dirname, "lambda/cfnNotify.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      role: new iam.Role(this, "CfnNotifyLambdaExecutionRole", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
        ],
      }),
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
        externalModules: ["aws-sdk"],
      },
    });

    const createTriggers = new NodejsFunction(
      this,
      "CreateTriggersLambdaFunctiopn",
      {
        functionName: `${project}-${stage}-createTriggers`,
        entry: path.join(__dirname, "lambda/createTriggers.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.minutes(15),
        role: new iam.Role(this, "CreateTriggersLambdaExecutionRole", {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole",
            ),
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaVPCAccessExecutionRole",
            ),
          ],
          inlinePolicies: {
            LambdaAssumeRolePolicy: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
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
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
                  actions: ["ec2:DescribeSecurityGroups"],
                  resources: [
                    `arn:aws:ec2:${this.region}:${this.account}:security-group/${lambdaSecurityGroup.securityGroupId}`,
                  ],
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
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
          externalModules: ["aws-sdk"],
        },
      },
    );

    const deleteIndex = new NodejsFunction(this, "DeleteIndexLambdaFunctiopn", {
      functionName: `${project}-${stage}-deleteIndex`,
      entry: path.join(__dirname, "lambda/deleteIndex.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(15),
      role: new iam.Role(this, "DeleteIndexLambdaExecutionRole", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
        ],
        inlinePolicies: {
          LambdaAssumeRolePolicy: new iam.PolicyDocument({
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
                resources: [`${openSearchDomain.attrArn}/*`],
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
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
        externalModules: ["aws-sdk"],
      },
    });

    const deleteTriggers = new NodejsFunction(
      this,
      "DeleteTriggersLambdaFunctiopn",
      {
        functionName: `${project}-${stage}-deleteTriggers`,
        entry: path.join(__dirname, "lambda/deleteTriggers.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.minutes(15),
        role: new iam.Role(this, "DeleteTriggersLambdaExecutionRole", {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole",
            ),
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaVPCAccessExecutionRole",
            ),
          ],
          inlinePolicies: {
            LambdaAssumeRolePolicy: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
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
              ],
            }),
          },
        }),
        vpc,
        vpcSubnets: {
          subnets: privateSubnets,
        },
        securityGroups: [lambdaSecurityGroup],
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
          externalModules: ["aws-sdk"],
        },
      },
    );

    const setupIndex = new NodejsFunction(this, "SetupIndexLambdaFunctiopn", {
      functionName: `${project}-${stage}-setupIndex`,
      entry: path.join(__dirname, "lambda/setupIndex.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(1),
      role: new iam.Role(this, "SetupIndexLambdaExecutionRole", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole",
          ),
        ],
        inlinePolicies: {
          LambdaAssumeRolePolicy: new iam.PolicyDocument({
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
                resources: [`${openSearchDomain.attrArn}/*`],
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
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
        externalModules: ["aws-sdk"],
      },
    });

    const functionNames: string[] = [
      "sinkChangelog",
      "sinkInsights",
      "sinkLegacyInsights",
      "sinkMain",
      "sinkSubtypes",
      "sinkTypes",
      "sinkCpocs",
    ];

    const lambdaFunctions: { [key: string]: NodejsFunction } = {};

    functionNames.forEach((functionName) => {
      lambdaFunctions[functionName] = new NodejsFunction(this, functionName, {
        functionName: `${project}-${stage}-${functionName}`,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, `lambda/${functionName}.ts`),
        handler: "handler",
        environment: {
          osDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
        },
        timeout: cdk.Duration.minutes(1),
        role: new iam.Role(this, `${functionName}LambdaExecutionRole`, {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole",
            ),
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaVPCAccessExecutionRole",
            ),
          ],
          inlinePolicies: {
            LambdaAssumeRolePolicy: new iam.PolicyDocument({
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
                  resources: [`${openSearchDomain.attrArn}/*`],
                }),
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
                  actions: [
                    "ec2:CreateNetworkInterface",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:DescribeVpcs",
                    "ec2:DeleteNetworkInterface",
                    "ec2:DescribeSubnets",
                    "ec2:DescribeSecurityGroups",
                  ],
                  resources: ["*"],
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
        retryAttempts: 0,
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
          externalModules: ["aws-sdk"],
        },
      });
    });

    const cleanupTriggersOnDelete = new NodejsFunction(
      this,
      "CleanupTriggersOnDeleteLambdaFunctiopn",
      {
        functionName: `${project}-${stage}-cleanupTriggersOnDelete`,
        entry: path.join(__dirname, "lambda/deleteTriggers.ts"),
        handler: "customResourceWrapper",
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.minutes(15),
        role: new iam.Role(this, "CleanupTriggersOnDeleteLambdaExecutionRole", {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole",
            ),
          ],
          inlinePolicies: {
            LambdaAssumeRolePolicy: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
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
      },
    );

    const cleanupTriggersOnDeleteProvider = new cr.Provider(
      this,
      "CleanupTriggersOnDeleteProvider",
      {
        onEventHandler: cleanupTriggersOnDelete,
      },
    );

    new cdk.CustomResource(this, "CleanupTriggersOnDelete", {
      serviceToken: cleanupTriggersOnDeleteProvider.serviceToken,
      properties: {
        functions: Object.values(lambdaFunctions).map((fn) => fn.functionName),
      },
    });

    const reindexDataStateMachineRole = new iam.Role(
      this,
      "ReindexDataStateMachineRole",
      {
        assumedBy: new iam.ServicePrincipal("states.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "CloudWatchLogsFullAccess",
          ),
        ],
        inlinePolicies: {
          masterOmDataStateMachine: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ["lambda:InvokeFunction"],
                resources: [
                  `arn:aws:lambda:${this.region}:${this.account}:function:${project}-${stage}-${stage}-*`,
                ],
              }),
            ],
          }),
        },
      },
    );

    const successState = new sfn.Succeed(this, "SuccessState");
    const notifyOfSuccessStep = new tasks.LambdaInvoke(
      this,
      "NotifyOfSuccess",
      {
        lambdaFunction: cfnNotify,
        outputPath: "$.Payload",
        payload: sfn.TaskInput.fromObject({
          "Context.$": "$$",
          Success: true,
        }),
      },
    );

    const failureState = new sfn.Fail(this, "FailureState");
    const notifyOfFailureStep = new tasks.LambdaInvoke(
      this,
      "NotifyOfFailure",
      {
        lambdaFunction: cfnNotify,
        outputPath: "$.Payload",
        payload: sfn.TaskInput.fromObject({
          "Context.$": "$$",
          Success: false,
        }),
      },
    ).next(failureState);

    const deleteAllTriggersStep = new tasks.LambdaInvoke(
      this,
      "DeleteAllTriggers",
      {
        lambdaFunction: deleteTriggers,
        outputPath: "$.Payload",
        payload: sfn.TaskInput.fromObject({
          "Context.$": "$$",
          functions: Object.values(lambdaFunctions).map(
            (fn) => fn.functionName,
          ),
        }),
      },
    ).addCatch(notifyOfFailureStep, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const deleteIndexStep = new tasks.LambdaInvoke(this, "DeleteIndex", {
      lambdaFunction: deleteIndex,
      outputPath: "$.Payload",
      payload: sfn.TaskInput.fromObject({
        "Context.$": "$$",
        osDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
      }),
    }).addCatch(notifyOfFailureStep, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const setupIndexStep = new tasks.LambdaInvoke(this, "SetupIndex", {
      lambdaFunction: setupIndex,
      outputPath: "$.Payload",
      payload: sfn.TaskInput.fromObject({
        "Context.$": "$$",
        osDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
      }),
    }).addCatch(notifyOfFailureStep, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const startIndexingDataStep = new tasks.LambdaInvoke(
      this,
      "StartIndexingData",
      {
        lambdaFunction: createTriggers,
        outputPath: "$.Payload",
        payload: sfn.TaskInput.fromObject({
          "Context.$": "$$",
          osDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
          brokerString,
          securityGroup: lambdaSecurityGroup.securityGroupId,
          consumerGroupPrefix,
          subnets: vpcInfo.privateSubnets,
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
      },
    ).addCatch(notifyOfFailureStep, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const checkDataProgressStep = new tasks.LambdaInvoke(
      this,
      "CheckDataProgress",
      {
        lambdaFunction: checkConsumerLag,
        outputPath: "$.Payload",
        payload: sfn.TaskInput.fromObject({
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
      },
    ).addCatch(notifyOfFailureStep, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const isDataReady = new sfn.Choice(this, "IsDataReady");
    const waitForData = new sfn.Wait(this, "WaitForData", {
      time: sfn.WaitTime.duration(cdk.Duration.seconds(3)),
    });

    const startIndexingInsightsStep = new tasks.LambdaInvoke(
      this,
      "StartIndexingInsights",
      {
        lambdaFunction: createTriggers,
        outputPath: "$.Payload",
        payload: sfn.TaskInput.fromObject({
          "Context.$": "$$",
          osDomain: `https://${openSearchDomain.attrDomainEndpoint}`,
          brokerString,
          securityGroup: lambdaSecurityGroup.securityGroupId,
          consumerGroupPrefix,
          subnets: vpcInfo.privateSubnets,
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
      },
    ).addCatch(notifyOfFailureStep, {
      errors: ["States.ALL"],
      resultPath: "$.error",
    });

    const definition = deleteAllTriggersStep
      .next(deleteIndexStep)
      .next(setupIndexStep)
      .next(startIndexingDataStep)
      .next(checkDataProgressStep)
      .next(
        isDataReady
          .when(
            sfn.Condition.booleanEquals("$.ready", true),
            startIndexingInsightsStep
              .next(notifyOfSuccessStep)
              .next(successState),
          )
          .when(
            sfn.Condition.booleanEquals("$.ready", false),
            waitForData.next(checkDataProgressStep),
          ),
      );

    const stateMachineLogGroup = new logs.LogGroup(
      this,
      "StateMachineLogGroup",
      {
        logGroupName: `/aws/vendedlogs/states/${project}-${stage}-${stage}-reindex`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const reindexStateMachine = new sfn.StateMachine(
      this,
      "ReindexDataStateMachine",
      {
        definition,
        role: reindexDataStateMachineRole,
        stateMachineName: `${project}-${stage}-${stage}-reindex`,
        logs: {
          destination: stateMachineLogGroup,
          level: sfn.LogLevel.ALL,
          includeExecutionData: true,
        },
      },
    );

    const runReindexLambda = new NodejsFunction(
      this,
      "runReindexLambdaFunction",
      {
        functionName: `${project}-${stage}-runReindex`,
        entry: path.join(__dirname, "lambda/runReindex.ts"),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.minutes(5),
        role: new iam.Role(this, "RunReindexLambdaExecutionRole", {
          assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole",
            ),
          ],
          inlinePolicies: {
            LambdaAssumeRolePolicy: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
                  actions: ["states:StartExecution"],
                  resources: [
                    `arn:aws:states:${this.region}:${this.account}:stateMachine:${project}-${stage}-${stage}-reindex`,
                  ],
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
      },
    );

    const runReindexProviderProvider = new cr.Provider(
      this,
      "RunReindexProvider",
      {
        onEventHandler: runReindexLambda,
      },
    );

    const runReindexCustomResource = new cdk.CustomResource(
      this,
      "RunReindex",
      {
        serviceToken: runReindexProviderProvider.serviceToken,
        properties: {
          stateMachine: reindexStateMachine.stateMachineArn,
        },
      },
    );

    runReindexCustomResource.node.addDependency(mapRoleCustomResource);

    if (isDev) {
      const cleanupKafka = new NodejsFunction(
        this,
        "CleanupKafkaLambdaFunctiopn",
        {
          functionName: `${project}-${stage}-cleanupKafka`,
          entry: path.join(__dirname, "lambda/cleanupKafka.ts"),
          handler: "handler",
          runtime: lambda.Runtime.NODEJS_18_X,
          timeout: cdk.Duration.minutes(15),
          role: new iam.Role(this, "CleanupKafkaLambdaExecutionRole", {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
              iam.ManagedPolicy.fromAwsManagedPolicyName(
                "service-role/AWSLambdaBasicExecutionRole",
              ),
              iam.ManagedPolicy.fromAwsManagedPolicyName(
                "service-role/AWSLambdaVPCAccessExecutionRole",
              ),
            ],
          }),
          vpc,
          vpcSubnets: {
            subnets: privateSubnets,
          },
          securityGroups: [lambdaSecurityGroup],
          bundling: {
            minify: true,
            sourceMap: true,
            target: "es2020",
            externalModules: ["aws-sdk"],
          },
        },
      );

      const cleanupKafkaProvider = new cr.Provider(
        this,
        "CleanupKafkaProvider",
        {
          onEventHandler: cleanupKafka,
        },
      );

      new cdk.CustomResource(this, "CleanupKafka", {
        serviceToken: cleanupKafkaProvider.serviceToken,
        properties: {
          brokerString,
          topicPatternsToDelete: [`${topicNamespace}aws.onemac.migration.cdc`],
        },
      });
    }

    return { openSearchDomain };
    // new CdkExport(
    //   this,
    //   project,
    //   stage,
    //   stack,
    //   "openSearchDomainArn",
    //   openSearchDomain.attrArn,
    // );

    // new CdkExport(
    //   this,
    //   project,
    //   stage,
    //   stack,
    //   "openSearchDomainEndpoint",
    //   `https://${openSearchDomain.attrDomainEndpoint}`,
    // );

    // new CdkExport(
    //   this,
    //   project,
    //   stage,
    //   stack,
    //   "openSearchDashboardEndpoint",
    //   `https://${openSearchDomain.attrDomainEndpoint}/_dashboards`,
    // );

    // new CdkExport(
    //   this,
    //   project,
    //   stage,
    //   stack,
    //   "topicName",
    //   `${topicNamespace}aws.onemac.migration.cdc`,
    // );
  }
}
