import { it, describe, expect } from "vitest";
import { handler } from "../handlers/createDashboardTemplateWidget";
import type {
  APIGatewayEvent,
  APIGatewayProxyCallback,
  Context,
} from "aws-lambda";

describe("templatize cloudwatch dashboard", () => {
  it("should return successful create dashboard template widget", async () => {
    process.env.lambdaArnToCall = "test-arn";

    const html = `
      <div style="width: 100%; display: flex; justify-content: center;">
        <a class="btn btn-primary">Get Dashboard Template</a>
      </div>
      <cwdb-action action="call" endpoint="test-arn" display="popup">
       {}
      </cwdb-action>
      `;

    const result = await handler(
      {} as APIGatewayEvent,
      {} as Context,
      {} as APIGatewayProxyCallback
    );

    expect(result).toEqual(html);
  });

  it("should return unsuccessful create dashboard template widget", async () => {
    process.env.lambdaArnToCall = "test-arn2";

    const html = `
      <div style="width: 100%; display: flex; justify-content: center;">
        <a class="btn btn-primary">Get Dashboard Template</a>
      </div>
      <cwdb-action action="call" endpoint="test-arns" display="popup">
       {}
      </cwdb-action>
      `;

    const result = await handler(
      {} as APIGatewayEvent,
      {} as Context,
      {} as APIGatewayProxyCallback
    );

    expect(result).not.toEqual(html);
  });

  it("should return an error message when there is an error with the lambda arn", async () => {
    process.env = {};

    const result = await handler(
      {} as APIGatewayEvent,
      {} as Context,
      {} as APIGatewayProxyCallback
    );
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        message: "An error occured",
      }),
    });
  });
});
