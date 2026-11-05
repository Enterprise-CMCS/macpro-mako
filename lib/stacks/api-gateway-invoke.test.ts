import { describe, expect, it } from "vitest";

import { apiGatewayInvokeResources } from "./api-gateway-invoke";

describe("apiGatewayInvokeResources", () => {
  it("returns the routed function ARNs", () => {
    const arns = [
      "arn:aws:lambda:us-east-1:123456789012:function:mako-main-api-search",
      "arn:aws:lambda:us-east-1:123456789012:function:mako-main-api-submit",
    ];

    expect(apiGatewayInvokeResources(arns)).toEqual(arns);
  });

  it("rejects an empty list", () => {
    expect(() => apiGatewayInvokeResources([])).toThrow(
      "API Gateway invoke policy requires at least one function ARN",
    );
  });

  it("rejects the account-wide wildcard ARN", () => {
    expect(() =>
      apiGatewayInvokeResources(["arn:aws:lambda:*:*:function:*"]),
    ).toThrow("API Gateway invoke policy must not use a wildcard function ARN");
  });
});
