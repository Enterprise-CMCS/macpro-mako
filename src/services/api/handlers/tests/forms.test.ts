import * as fs from "fs";
import { it, describe, expect, vi } from "vitest";
import { forms } from "../forms";
import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";

describe("Forms Lambda Tests", () => {
  it("should return 400 with error message if fileId is not provided", async () => {
    const event = {
      body: JSON.stringify({}),
    } as APIGatewayProxyEvent;
    const result = await forms(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: "File ID was not provided",
    });
  });

  it("should return 500 with error message if filePath is not found", async () => {
    const event = {
      body: JSON.stringify({ fileId: "test", formVersion: "1" }),
    } as APIGatewayProxyEvent;
    const result = await forms(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: "ENOENT: no such file or directory, open '/opt/test/v1.json'",
    });
  });

  it("should return 200 with JSON data if everything is valid", async () => {
    vi.spyOn(fs.promises, "readFile").mockResolvedValue(
      JSON.stringify({ key: "value" })
    );

    const event = {
      body: JSON.stringify({ fileId: "testform", formVersion: "1" }),
    } as APIGatewayProxyEvent;
    const result = await forms(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers["Content-Type"]).toBe("application/json");
  });
});
