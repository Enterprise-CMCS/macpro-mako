import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayEvent, APIGatewayProxyEventHeaders, Context } from "aws-lambda";
import { describe, expect, it } from "vitest";

import { normalizeEvent, NormalizeEventOptions } from "./normalizations";

const setupHandler = ({
  expectedEvent = undefined,
  options = {
    opensearch: false,
    kafka: false,
    disableCors: false,
  },
}: {
  expectedEvent?: APIGatewayEvent;
  options?: NormalizeEventOptions;
} = {}) =>
  middy()
    .use(
      httpErrorHandler({ fallbackMessage: JSON.stringify({ message: "Internal server error" }) }),
    )
    .use(normalizeEvent(options))
    .handler((event: APIGatewayEvent) => {
      if (expectedEvent) {
        expect(event).toEqual(expectedEvent);
      }
      return {
        statusCode: 200,
        body: "OK",
      };
    });

describe("normalizeEvent middleware", () => {
  it("should add the default headers if the headers are missing", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({
      expectedEvent: {
        body: "test",
        headers: {
          "Content-Type": "application/json",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent,
    });

    await handler(event, {} as Context);
  });

  it("should add Content-Type to the header, if it is missing", async () => {
    const event = {
      body: "test",
      headers: {
        Host: "developer.mozilla.org",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = setupHandler({
      expectedEvent: {
        body: "test",
        headers: {
          "Content-Type": "application/json",
          Host: "developer.mozilla.org",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent,
    });

    await handler(event, {} as Context);
  });

  it("should not set the Content-Type header if it is already set", async () => {
    const event = {
      body: "test",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = setupHandler({
      expectedEvent: {
        body: "test",
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent,
    });

    await handler(event, {} as Context);
  });

  it("should handle any case for checking Content-Type header", async () => {
    const event = {
      body: "test",
      headers: {
        "content-TYPE": "text/html; charset=utf-8",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent;

    const handler = setupHandler({
      expectedEvent: {
        body: "test",
        headers: {
          "content-TYPE": "text/html; charset=utf-8",
        } as APIGatewayProxyEventHeaders,
      } as APIGatewayEvent,
    });

    await handler(event, {} as Context);
  });

  it("should return 400 if the event body is not set", async () => {
    const event = {} as APIGatewayEvent;

    // using the `httpErrorHandler` middleware here to handle the error
    // throw by `normalizeEvent` when the event body is not defined
    const handler = setupHandler();

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 500 if the opensearch option is true and osDomain is not set", async () => {
    const osDomain = process.env.osDomain;
    delete process.env.osDomain;

    const event = {
      body: "test",
    } as APIGatewayEvent;

    // using the `httpErrorHandler` middleware here to handle the error
    // throw by `normalizeEvent` when the event body is not defined
    const handler = setupHandler({ options: { opensearch: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));

    process.env.osDomain = osDomain;
  });

  it("should return 500 if the opensearch option is true and indexNamespace is not set", async () => {
    const indexNamespace = process.env.indexNamespace;
    delete process.env.indexNamespace;

    const event = {
      body: "test",
    } as APIGatewayEvent;

    // using the `httpErrorHandler` middleware here to handle the error
    // throw by `normalizeEvent` when the event body is not defined
    const handler = setupHandler({ options: { opensearch: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));

    process.env.indexNamespace = indexNamespace;
  });

  it("should return 500 if the opensearch option is true and osDomain and indexNamespace is not set", async () => {
    const osDomain = process.env.osDomain;
    const indexNamespace = process.env.indexNamespace;
    delete process.env.indexNamespace;
    delete process.env.osDomain;

    const event = {
      body: "test",
    } as APIGatewayEvent;

    // using the `httpErrorHandler` middleware here to handle the error
    // throw by `normalizeEvent` when the event body is not defined
    const handler = setupHandler({ options: { opensearch: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));

    process.env.osDomain = osDomain;
    process.env.indexNamespace = indexNamespace;
  });

  it("should not check for environment variables if the opensearch option is undefined", async () => {
    const osDomain = process.env.osDomain;
    const indexNamespace = process.env.indexNamespace;
    delete process.env.indexNamespace;
    delete process.env.osDomain;

    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler();

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");

    process.env.osDomain = osDomain;
    process.env.indexNamespace = indexNamespace;
  });

  it("should not check for environment variables if the opensearch option is false", async () => {
    const osDomain = process.env.osDomain;
    const indexNamespace = process.env.indexNamespace;
    delete process.env.indexNamespace;
    delete process.env.osDomain;

    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({ options: { opensearch: false } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");

    process.env.osDomain = osDomain;
    process.env.indexNamespace = indexNamespace;
  });

  it("should return 500 if the kafka option is true and topicName is not set", async () => {
    const topicName = process.env.topicName;
    delete process.env.topicName;

    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({ options: { kafka: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));

    process.env.topicName = topicName;
  });

  it("should not check for topicName if the kafka option is undefined", async () => {
    const topicName = process.env.topicName;
    delete process.env.topicName;

    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler();

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");

    process.env.topicName = topicName;
  });

  it("should not check for topicName if the kafka option is false", async () => {
    const topicName = process.env.topicName;
    delete process.env.topicName;

    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({ options: { kafka: false } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");

    process.env.topicName = topicName;
  });

  it("should add CORS headers to the response if disableCors is undefined", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler();

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
    expect(res.headers).toEqual({
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    });
  });

  it("should add CORS headers to the response if disableCors is false", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({ options: { disableCors: false } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
    expect(res.headers).toEqual({
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    });
  });

  it("should not add CORS headers to the response if disableCors is true", async () => {
    const event = {
      body: "test",
    } as APIGatewayEvent;

    const handler = setupHandler({ options: { disableCors: true } });

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("OK");
    expect(res.headers).toBeUndefined();
  });
});
