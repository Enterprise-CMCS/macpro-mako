import { IAspect } from "aws-cdk-lib";
import { CfnFunction } from "aws-cdk-lib/aws-lambda";
import { IConstruct } from "constructs";

const OUTDATED_RUNTIMES = new Set([
  "nodejs20.x",
  "nodejs18.x",
  "nodejs16.x",
  "nodejs14.x",
  "nodejs12.x",
]);
const MIN_RUNTIME = "nodejs22.x";

export class LambdaRuntimeMinVersionAspect implements IAspect {
  public visit(node: IConstruct): void {
    if (node instanceof CfnFunction && OUTDATED_RUNTIMES.has(node.runtime as string)) {
      node.addPropertyOverride("Runtime", MIN_RUNTIME);
    }
  }
}
