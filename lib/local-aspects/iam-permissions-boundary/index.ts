import { IAspect } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { isCfnRole } from "shared-utils";

export class IamPermissionsBoundaryAspect implements IAspect {
  private readonly permissionsBoundaryArn: string;

  constructor(permissionBoundaryArn: string) {
    this.permissionsBoundaryArn = permissionBoundaryArn;
  }

  public visit(node: IConstruct): void {
    if (node instanceof iam.Role && isCfnRole(node.node.defaultChild)) {
      node.node.defaultChild.addPropertyOverride(
        "PermissionsBoundary",
        this.permissionsBoundaryArn,
      );
    }
  }
}
