import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CfnWebACL,
  CfnLoggingConfiguration,
  CfnWebACLAssociation,
} from "aws-cdk-lib/aws-wafv2";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { RestApi } from "aws-cdk-lib/aws-apigateway";

interface WafProps {
  readonly name: string;
  readonly rateLimit?: number;
  readonly awsCommonExcludeRules?: string[];
  readonly awsIpReputationExcludeRules?: string[];
  readonly awsBadInputsExcludeRules?: string[];
}

class WafConstruct extends Construct {
  public readonly webAcl: CfnWebACL;
  public readonly logGroup: LogGroup;

  constructor(
    scope: Construct,
    id: string,
    props: WafProps,
    scopeType: string,
  ) {
    super(scope, id);

    const {
      name,
      rateLimit = 5000,
      awsCommonExcludeRules = [],
      awsIpReputationExcludeRules = [],
      awsBadInputsExcludeRules = [],
    } = props;

    this.logGroup = new LogGroup(this, "LogGroup", {
      logGroupName: `aws-waf-logs-${name}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.webAcl = new CfnWebACL(this, "WebACL", {
      scope: scopeType,
      defaultAction: { block: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: `${name}-webacl`,
      },
      rules: this.generateRules(
        name,
        rateLimit,
        awsCommonExcludeRules,
        awsIpReputationExcludeRules,
        awsBadInputsExcludeRules,
      ),
      name: `${name}`,
    });

    new CfnLoggingConfiguration(this, "LoggingConfiguration", {
      resourceArn: this.webAcl.attrArn,
      logDestinationConfigs: [this.logGroup.logGroupArn],
    });
  }

  private generateRules(
    name: string,
    rateLimit: number,
    awsCommonExcludeRules: string[],
    awsIpReputationExcludeRules: string[],
    awsBadInputsExcludeRules: string[],
  ) {
    const generateExcludeRuleList = (excludeRules: string[]) => {
      return excludeRules.map((rule) => ({ name: rule }));
    };

    return [
      {
        name: `DDOSRateLimitRule`,
        priority: 10,
        action: { block: {} },
        statement: {
          rateBasedStatement: {
            limit: rateLimit,
            aggregateKeyType: "IP",
          },
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `${name}-DDOSRateLimitRuleMetric`,
        },
      },
      {
        name: `AWSCommonRule`,
        priority: 20,
        overrideAction: { none: {} },
        statement: {
          managedRuleGroupStatement: {
            vendorName: "AWS",
            name: "AWSManagedRulesCommonRuleSet",
            excludedRules: generateExcludeRuleList(awsCommonExcludeRules),
          },
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `${name}-AWSCommonRuleMetric`,
        },
      },
      {
        name: `AWSManagedRulesAmazonIpReputationList`,
        priority: 30,
        overrideAction: { none: {} },
        statement: {
          managedRuleGroupStatement: {
            vendorName: "AWS",
            name: "AWSManagedRulesAmazonIpReputationList",
            excludedRules: generateExcludeRuleList(awsIpReputationExcludeRules),
          },
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `${name}-AWSManagedRulesAmazonIpReputationListMetric`,
        },
      },
      {
        name: `AWSManagedRulesKnownBadInputsRuleSet`,
        priority: 40,
        overrideAction: { none: {} },
        statement: {
          managedRuleGroupStatement: {
            vendorName: "AWS",
            name: "AWSManagedRulesKnownBadInputsRuleSet",
            excludedRules: generateExcludeRuleList(awsBadInputsExcludeRules),
          },
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `${name}-AWSManagedRulesKnownBadInputsRuleSetMetric`,
        },
      },
      {
        name: `allow-usa-plus-territories`,
        priority: 50,
        action: { allow: {} },
        statement: {
          geoMatchStatement: {
            countryCodes: [
              "AS",
              "FM",
              "GU",
              "MH",
              "MP",
              "PR",
              "PW",
              "UM",
              "US",
              "VI",
            ],
          },
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `${name}-allow-usa-plus-territories-metric`,
        },
      },
    ];
  }
}

export class CloudFrontWaf extends WafConstruct {
  constructor(scope: Construct, id: string, props: WafProps) {
    super(scope, id, props, "CLOUDFRONT");
  }
}

interface RegionalWafProps extends WafProps {
  readonly apiGateway: RestApi;
}

export class RegionalWaf extends WafConstruct {
  constructor(scope: Construct, id: string, props: RegionalWafProps) {
    super(scope, id, props, "REGIONAL");
    const { apiGateway } = props;
    new CfnWebACLAssociation(this, "WebACLAssociation", {
      resourceArn: apiGateway.deploymentStage.stageArn,
      webAclArn: this.webAcl.attrArn,
    });
  }
}
