import { IAspect } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class IamPermissionsBoundaryAspect implements IAspect {
  private readonly permissionsBoundaryArn: string;

  constructor(permissionBoundaryArn: string) {
    this.permissionsBoundaryArn = permissionBoundaryArn;
  }

  public visit(node: IConstruct): void {
    if (node instanceof iam.Role) {
      const roleResource = node.node.defaultChild as iam.CfnRole;
      roleResource.addPropertyOverride(
        "PermissionsBoundary",
        this.permissionsBoundaryArn,
      );
    }
  }
}
