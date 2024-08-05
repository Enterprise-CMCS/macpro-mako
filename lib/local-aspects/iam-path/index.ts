import { IAspect } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { isCfnRole, isCfnUser, isCfnGroup } from "shared-utils";

export class IamPathAspect implements IAspect {
  private readonly iamPath: string;

  constructor(iamPath: string) {
    this.iamPath = iamPath;
  }

  public visit(node: IConstruct): void {
    if (node instanceof iam.Role && isCfnRole(node.node.defaultChild)) {
      node.node.defaultChild?.addPropertyOverride("Path", this.iamPath);
    }

    if (node instanceof iam.User && isCfnUser(node.node.defaultChild)) {
      node.node.defaultChild.addPropertyOverride("Path", this.iamPath);
    }

    if (node instanceof iam.Group && isCfnGroup(node.node.defaultChild)) {
      node.node.defaultChild.addPropertyOverride("Path", this.iamPath);
    }
  }
}
