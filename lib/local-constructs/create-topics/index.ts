import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import {
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { ISecurityGroup, ISubnet, IVpc } from "aws-cdk-lib/aws-ec2";
import { commonBundlingOptions } from "../../config/bundling-config";

interface CreateTopicsProps {
  vpc: IVpc;
  privateSubnets: ISubnet[];
  securityGroups: ISecurityGroup[];
  brokerString: string;
  topics: { topic: string }[];
}

export class CreateTopics extends Construct {
  constructor(scope: Construct, id: string, props: CreateTopicsProps) {
    super(scope, id);

    const { vpc, privateSubnets, securityGroups, brokerString, topics } = props;

    const lambdaLogGroup = new LogGroup(this, `CreateTopicsLogGroup`, {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambda = new NodejsFunction(this, "CreateTopicsLambda", {
      entry: join(__dirname, "src/createTopics.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.minutes(5),
      depsLockFilePath: join(__dirname, "../../../bun.lockb"),
      role: new Role(this, "CreateTopicsLambdaExecutionRole", {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
          ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
        ],
        inlinePolicies: {
          InvokeLambdaPolicy: new PolicyDocument({
            statements: [
              new PolicyStatement({
                effect: Effect.DENY,
                actions: ["logs:CreateLogGroup"],
                resources: ["*"],
              }),
            ],
          }),
        },
      }),
      logGroup: lambdaLogGroup,
      vpc,
      vpcSubnets: {
        subnets: privateSubnets,
      },
      securityGroups,
      bundling: commonBundlingOptions,
    });

    const customResourceLogGroup = new LogGroup(this, `createTopicsCustomResourceLogGroup`, {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const customResource = new AwsCustomResource(this, "CustomResource", {
      onCreate: {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: lambda.functionName,
          Payload: JSON.stringify({
            RequestType: "Create",
            ResourceProperties: {
              brokerString: brokerString,
              topicsToCreate: topics,
            },
          }),
        },
        physicalResourceId: PhysicalResourceId.of("create-topics-resource"),
      },
      onUpdate: {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: lambda.functionName,
          Payload: JSON.stringify({
            RequestType: "Update",
            ResourceProperties: {
              brokerString: brokerString,
              topicsToCreate: topics,
            },
          }),
        },
        physicalResourceId: PhysicalResourceId.of("create-topics-resource"),
      },
      logGroup: customResourceLogGroup,
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          actions: ["lambda:InvokeFunction"],
          resources: [lambda.functionArn],
        }),
        new PolicyStatement({
          effect: Effect.DENY,
          actions: ["logs:CreateLogGroup"],
          resources: ["*"],
        }),
      ]),
    });
    const policy = customResource.node.findChild("CustomResourcePolicy");
    customResource.node.addDependency(policy);
    customResourceLogGroup.node.addDependency(policy);
  }
}
