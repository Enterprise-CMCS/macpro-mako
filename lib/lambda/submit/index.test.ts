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
  uploadSubsequentDocuments,
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
  it("should have no body", async () => {
    const event = {} as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('"Event body required"');
  });
  it("should have no event in the body", async () => {
    const event = {
      body: `{"event": ""}`,
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('{"message":"Bad Request - Missing event name in body"}');
  });

  it("should have a bad event in the body", async () => {
    const event = {
      body: `{"event": "Not a real event"}`,
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('{"message":"Bad Request - Unknown event type Not a real event"}');
  });
  it("should start to create an capitated ammendment event", async () => {
    const base = JSON.stringify(capitatedAmendmentBase);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an capitated ammendment event", async () => {
    const base = JSON.stringify(capitatedAmendmentBase);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an app-k event", async () => {
    const base = JSON.stringify(appkBase);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an capitated initial event", async () => {
    const base = JSON.stringify(capitatedInitial);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an contracting ammendment event", async () => {
    const base = JSON.stringify(contractingAmmendment);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an contracting initial event", async () => {
    const base = JSON.stringify(contractingInitial);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an contracting renewal event", async () => {
    const base = JSON.stringify(contractingRenewal);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an new chip submission event", async () => {
    const base = JSON.stringify(newChipSubmission);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an new chip medicaid submission event", async () => {
    const base = JSON.stringify(newMedicaidSubmission);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an new respond to rai event", async () => {
    const base = JSON.stringify(respondToRai);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an temporary extension event", async () => {
    const base = JSON.stringify(temporaryExtension);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an toggle withdraw event", async () => {
    const base = JSON.stringify(toggleWithdrawRai);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an withdraw package event", async () => {
    const base = JSON.stringify(withdrawPackage);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an withdraw rai event", async () => {
    const base = JSON.stringify(withdrawRai);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an capitated renewal event", async () => {
    const base = JSON.stringify(capitatedRenewal);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an contracting initial event", async () => {
    const base = JSON.stringify(contractingInitial);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
  it("should start to create an upload subsequent documents event", async () => {
    const base = JSON.stringify(uploadSubsequentDocuments);

    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"message":"success"}');
  });
});
