import { IAspect } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { CfnResource } from "aws-cdk-lib";

export class IamPermissionsBoundaryAspect implements IAspect {
  private readonly permissionsBoundaryArn: string;

  constructor(permissionBoundaryArn: string) {
    this.permissionsBoundaryArn = permissionBoundaryArn;
  }

  public visit(node: IConstruct): void {
    // Check if the node is an instance of the higher-level iam.Role construct
    if (node instanceof iam.Role) {
      const roleResource = node.node.defaultChild as iam.CfnRole;
      roleResource.addPropertyOverride(
        "PermissionsBoundary",
        this.permissionsBoundaryArn,
      );
    }
    // Check if the node is an instance of a low-level CloudFormation resource (CfnRole)
    else if (node instanceof iam.CfnRole) {
      node.addPropertyOverride(
        "PermissionsBoundary",
        this.permissionsBoundaryArn,
      );
    }
    // For roles created by other constructs such as AutoDeleteObjects which may not be of iam.Role or iam.CfnRole
    else if (
      CfnResource.isCfnResource(node) &&
      (node as CfnResource).cfnResourceType === "AWS::IAM::Role"
    ) {
      (node as iam.CfnRole).addPropertyOverride(
        "PermissionsBoundary",
        this.permissionsBoundaryArn,
      );
    }
  }
}
