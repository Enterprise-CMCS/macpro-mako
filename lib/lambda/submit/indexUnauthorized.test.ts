import { submit } from "./index";
import { APIGatewayEvent } from "node_modules/shared-types";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { getRequestContext } from "mocks";
import {
  capitatedAmendmentBase,
  appkBase,
  capitatedInitial,
  capitatedRenewal,
  contractingAmmendment,
  contractingInitial,
  contractingRenewal,
  newChipSubmission,
  newMedicaidSubmission,
  respondToRai,
  temporaryExtension,
  toggleWithdrawRai,
  withdrawPackage,
  withdrawRai,
} from "mocks/data/submit/base";

vi.mock("kafkajs", () => {
  const producer = {
    connect: vi.fn(),
    send: vi.fn(),
    disconnect: vi.fn(),
  };
  const kafka = {
    producer: () => producer,
  };
  return {
    Kafka: vi.fn(() => kafka),
    Producer: vi.fn(() => producer),
  };
});
describe("submit Lambda function", () => {
  let brokerString: string | undefined;
  beforeEach(() => {
    brokerString = process.env.brokerString;
    process.env.brokerString = "broker1,broker2";
  });

  afterEach(() => {
    process.env.brokerString = brokerString;
  });

  it("should not have authorization to create a capitated ammendment event", async () => {
    const base = JSON.stringify(capitatedAmendmentBase);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a app-k submission event", async () => {
    const base = JSON.stringify(appkBase);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a capitated initial event", async () => {
    const base = JSON.stringify(capitatedInitial);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a capitated renewal event", async () => {
    const base = JSON.stringify(capitatedRenewal);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a contracting ammendment event", async () => {
    const base = JSON.stringify(contractingAmmendment);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a contracting renewal event", async () => {
    const base = JSON.stringify(contractingRenewal);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a new chip submission event", async () => {
    const base = JSON.stringify(newChipSubmission);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a new medicaid submission event", async () => {
    const base = JSON.stringify(newMedicaidSubmission);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a respond to rai event", async () => {
    const base = JSON.stringify(respondToRai);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a temporary extension event", async () => {
    const base = JSON.stringify(temporaryExtension);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a toggle withdraw rai event", async () => {
    const base = JSON.stringify(toggleWithdrawRai);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a toggle withdraw rai event", async () => {
    const base = JSON.stringify(withdrawRai);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a toggle withdraw package event", async () => {
    const base = JSON.stringify(withdrawPackage);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
  it("should not have authorization to create a toggle contracting initial event", async () => {
    const base = JSON.stringify(contractingInitial);

    const event = {
      body: base,
      requestContext: getRequestContext("f3a1b6d6-3bc9-498d-ac22-41a6d46982c9"),
    } as unknown as APIGatewayEvent;

    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
});
