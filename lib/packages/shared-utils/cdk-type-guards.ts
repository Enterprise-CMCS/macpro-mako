import * as iam from "aws-cdk-lib/aws-iam";

export function isCfnRole(child: any): child is iam.CfnRole {
  return child instanceof iam.CfnRole;
}

export function isCfnUser(child: any): child is iam.CfnUser {
  return child instanceof iam.CfnUser;
}

export function isCfnGroup(child: any): child is iam.CfnGroup {
  return child instanceof iam.CfnGroup;
}
