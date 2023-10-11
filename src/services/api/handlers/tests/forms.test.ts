import * as fs from "fs";
import { it, describe, expect, vi } from "vitest";
import { forms } from "../forms";
import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";

describe("Forms Lambda Tests", () => {
  it("should return 400 with error message if formId is not provided", async () => {
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
      body: JSON.stringify({ formId: "test", formVersion: "1" }),
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
      body: JSON.stringify({ formId: "testform", formVersion: "1" }),
    } as APIGatewayProxyEvent;
    const result = await forms(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers["Content-Type"]).toBe("application/json");
  });

  it("should return 500 with a custom error message for other internal errors", async () => {
    vi.spyOn(fs.promises, "readFile").mockRejectedValue(
      new Error("Internal Server Error Message")
    );

    const event = {
      body: JSON.stringify({ formId: "testform", formVersion: "1" }),
    } as APIGatewayProxyEvent;

    const result = await forms(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: "Internal Server Error Message",
    });
  });

  it("should return the correct JSON data for different file versions", async () => {
    vi.spyOn(fs.promises, "readFile").mockImplementation(async (filePath) => {
      const filePathString = filePath.toString();
      if (filePathString.includes("/opt/testform/v1.json")) {
        return JSON.stringify({ version: "1", data: "v1 data" });
      } else if (filePathString.includes("/opt/testform/v2.json")) {
        return JSON.stringify({ version: "2", data: "v2 data" });
      }
    });

    const eventV1 = {
      body: JSON.stringify({ formId: "testform", formVersion: "1" }),
    } as APIGatewayProxyEvent;
    const eventV2 = {
      body: JSON.stringify({ formId: "testform", formVersion: "2" }),
    } as APIGatewayProxyEvent;

    const resultV1 = await forms(eventV1);
    const resultV2 = await forms(eventV2);

    expect(resultV1.statusCode).toBe(200);
    expect(resultV2.statusCode).toBe(200);

    expect(JSON.parse(resultV1.body)).toEqual({
      version: "1",
      data: "v1 data",
    });
    expect(JSON.parse(resultV2.body)).toEqual({
      version: "2",
      data: "v2 data",
    });
  });
});
