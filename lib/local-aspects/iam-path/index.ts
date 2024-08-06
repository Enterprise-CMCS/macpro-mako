import { IAspect } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class IamPathAspect implements IAspect {
  private readonly iamPath: string;

  constructor(iamPath: string) {
    this.iamPath = iamPath;
  }

  public visit(node: IConstruct): void {
    if (node instanceof iam.Role) {
      const roleResource = node.node.defaultChild as iam.CfnRole;
      roleResource.addPropertyOverride("Path", this.iamPath);
    }

    if (node instanceof iam.User) {
      const userResource = node.node.defaultChild as iam.CfnUser;
      userResource.addPropertyOverride("Path", this.iamPath);
    }

    if (node instanceof iam.Group) {
      const groupResource = node.node.defaultChild as iam.CfnGroup;
      groupResource.addPropertyOverride("Path", this.iamPath);
    }
  }
}
