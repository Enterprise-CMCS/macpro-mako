/**
 * Returns Lambda ARNs for the API Gateway invoke policy.
 * Rejects the account-wide wildcard so the role stays limited to routed functions.
 */
export function apiGatewayInvokeResources(functionArns: string[]): string[] {
  if (functionArns.length === 0) {
    throw new Error("API Gateway invoke policy requires at least one function ARN");
  }

  if (functionArns.some((arn) => arn === "arn:aws:lambda:*:*:function:*")) {
    throw new Error("API Gateway invoke policy must not use a wildcard function ARN");
  }

  return functionArns;
}
