import { submit } from "./index";
import { APIGatewayEvent } from "node_modules/shared-types";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { getRequestContext } from "mocks";
import { automatedStateSubmitterUsername } from "mocks/data/users/stateSubmitters";
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
  it.each([
    [
      "should not have authorization to create a capitated ammendment event",
      JSON.stringify(capitatedAmendmentBase),
    ],
    ["should not have authorization to create a appk event", JSON.stringify(appkBase)],
    [
      "should not have authorization to create a capitated initial event",
      JSON.stringify(capitatedInitial),
    ],
    [
      "should not have authorization to create a capitated renewal event",
      JSON.stringify(capitatedRenewal),
    ],
    [
      "should not have authorization to create a contracting ammendment event",
      JSON.stringify(contractingAmmendment),
    ],
    [
      "should not have authorization to create a contracting renewal event",
      JSON.stringify(contractingRenewal),
    ],
    [
      "should not have authorization to create a contracting initial event",
      JSON.stringify(contractingInitial),
    ],
    [
      "should not have authorization to create a new medicaid submission event",
      JSON.stringify(newMedicaidSubmission),
    ],
    [
      "should not have authorization to create a new chip submission event",
      JSON.stringify(newChipSubmission),
    ],
    [
      "should not have authorization to create a respond to rai event",
      JSON.stringify(respondToRai),
    ],
    [
      "should not have authorization to create a temporary extension event",
      JSON.stringify(temporaryExtension),
    ],
    [
      "should not have authorization to create a toggle withdraw rai event",
      JSON.stringify(toggleWithdrawRai),
    ],
    [
      "should not have authorization to create a withdraw package event",
      JSON.stringify(withdrawPackage),
    ],
    ["should not have authorization to create a withdraw rai event", JSON.stringify(withdrawRai)],
  ])("%s", async (_, base) => {
    const event = {
      body: base,
      requestContext: getRequestContext(automatedStateSubmitterUsername),
    } as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });
});
