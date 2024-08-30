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

interface CleanupKafkaProps {
  vpc: IVpc;
  privateSubnets: ISubnet[];
  securityGroups: ISecurityGroup[];
  brokerString: string;
  topicPatternsToDelete: string[];
}

export class CleanupKafka extends Construct {
  constructor(scope: Construct, id: string, props: CleanupKafkaProps) {
    super(scope, id);

    const {
      vpc,
      privateSubnets,
      securityGroups,
      brokerString,
      topicPatternsToDelete,
    } = props;

    const logGroup = new LogGroup(this, `cleanupKafkaLogGroup`, {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambda = new NodejsFunction(this, "CleanupKafkaLambdaFunction", {
      entry: join(__dirname, "src/cleanupKafka.ts"),
      handler: "handler",
      depsLockFilePath: join(__dirname, "../../../bun.lockb"),
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.minutes(15),
      role: new Role(this, "CleanupKafkaLambdaExecutionRole", {
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
      logGroup,
      vpc,
      vpcSubnets: {
        subnets: privateSubnets,
      },
      securityGroups,
      bundling: {
        minify: true,
        sourceMap: true,
        define: {
          __IS_FRONTEND__: "false",
        },
      },
    });

    const customResourceLogGroup = new LogGroup(
      this,
      `cleanupKafkaCustomResourceLogGroup`,
      {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    );

    const customResource = new AwsCustomResource(
      this,
      "CleanupKafkaCustomResource",
      {
        onDelete: {
          service: "Lambda",
          action: "invoke",
          parameters: {
            FunctionName: lambda.functionName,
            Payload: JSON.stringify({
              RequestType: "Delete",
              ResourceProperties: {
                brokerString,
                topicPatternsToDelete,
              },
            }),
          },
          physicalResourceId: PhysicalResourceId.of("cleanup-kafka"),
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
      },
    );
    const policy = customResource.node.findChild("CustomResourcePolicy");
    customResource.node.addDependency(policy);
    customResourceLogGroup.node.addDependency(policy);
  }
}
