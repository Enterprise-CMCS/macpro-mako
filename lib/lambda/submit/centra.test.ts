import * as packageApi from "libs/api/package";
import { getRequestContext, testReviewer } from "mocks";
import { newMedicaidSubmission } from "mocks/data/submit/base";
import { mockedProducer } from "mocks/helpers/kafka.utils";
import { APIGatewayEvent } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as userService from "../user-management/userManagementService";
import { submit } from "./index";

const CENTRA_TOPIC = "aws.onemac.centra.events";
const CDC_TOPIC = "aws.onemac.migration.cdc";

const ceFile = {
  filename: "request.pdf",
  title: "Request",
  bucket: "mako-attachments",
  key: "MD-CE-26-001/ceTemplate/request.pdf",
  uploadDate: 1762452000000,
};

function ceRecordBody(overrides: Record<string, unknown> = {}) {
  return {
    id: "MD-CE-26-001",
    state: "MD",
    event: "ce-record-submitted",
    hardshipKind: "CE_UNEMPLOYMENT",
    proposedEffectiveDate: 1762400000000,
    additionalInformation: null,
    attachments: {
      ceTemplate: { files: [ceFile] },
      other: { files: [] },
    },
    ...overrides,
  };
}

function ceSubsequentBody(overrides: Record<string, unknown> = {}) {
  return {
    id: "MD-CE-26-001",
    state: "MD",
    event: "ce-subsequent-documents",
    hardshipKind: "CE_SADE",
    additionalInformation: "Labor table added.",
    attachments: {
      ceTemplate: { files: [] },
      other: {
        files: [
          {
            ...ceFile,
            filename: "labor.pdf",
            key: "MD-CE-26-001/other/labor.pdf",
          },
        ],
      },
    },
    ...overrides,
  };
}

function submitEvent(
  body: Record<string, unknown>,
  user?: Parameters<typeof getRequestContext>[0],
) {
  return {
    body: JSON.stringify(body),
    requestContext: getRequestContext(user),
  } as unknown as APIGatewayEvent;
}

function topicsSent() {
  return mockedProducer.send.mock.calls.map((call) => call[0]?.topic as string);
}

describe("CEntra submit", () => {
  const restorers: Array<() => void> = [];

  beforeEach(() => {
    process.env.topicName = CDC_TOPIC;
    process.env.centraTopicName = CENTRA_TOPIC;
    mockedProducer.send.mockResolvedValue([{ partition: 0, offset: "1" }]);
    mockedProducer.connect.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (restorers.length > 0) {
      restorers.pop()?.();
    }
  });

  it("publishes an initial record only to the centra topic", async () => {
    const result = await submit(submitEvent(ceRecordBody()));

    expect(result.statusCode).toBe(200);
    expect(topicsSent()).toEqual([CENTRA_TOPIC]);
    expect(topicsSent()).not.toContain(CDC_TOPIC);

    const message = mockedProducer.send.mock.calls[0][0].messages[0];
    expect(message.key).toBe("MD-CE-26-001");
    expect(message.headers).toEqual({ source: "mako" });
    expect(JSON.parse(message.value)).toMatchObject({
      event: "ce-record-submitted",
      operationType: "CE_RECORD_SUBMITTED",
      id: "MD-CE-26-001",
      state: "MD",
      authority: "CE_HARDSHIP_EXCEPTION",
      hardshipKind: "CE_UNEMPLOYMENT",
      origin: "mako",
      submitterEmail: "mako.stateuser@gmail.com",
      submitterName: "Stateuser Tester",
    });
  });

  it("publishes subsequent documents only to the centra topic", async () => {
    const itemExists = vi.spyOn(packageApi, "itemExists").mockResolvedValue(true);
    restorers.push(() => itemExists.mockRestore());

    const result = await submit(submitEvent(ceSubsequentBody()));

    expect(result.statusCode).toBe(200);
    expect(topicsSent()).toEqual([CENTRA_TOPIC]);
    expect(JSON.parse(mockedProducer.send.mock.calls[0][0].messages[0].value)).toMatchObject({
      event: "ce-subsequent-documents",
      operationType: "CE_SUBSEQUENT_DOCUMENTS",
      hardshipKind: "CE_SADE",
      authority: "CE_HARDSHIP_EXCEPTION",
    });
  });

  it("keeps non-CEntra submissions on the migration topic", async () => {
    const result = await submit(submitEvent(newMedicaidSubmission));

    expect(result.statusCode).toBe(200);
    expect(topicsSent()).toContain(CDC_TOPIC);
    expect(topicsSent()).not.toContain(CENTRA_TOPIC);
  });

  it("rejects a submitter who is not authorized for the package state", async () => {
    const states = vi.spyOn(userService, "getActiveStatesForUserByEmail").mockResolvedValue(["CO"]);
    restorers.push(() => states.mockRestore());

    const result = await submit(submitEvent(ceRecordBody()));

    expect(result.statusCode).toBe(500);
    expect(mockedProducer.send).not.toHaveBeenCalled();
  });

  it("rejects a CMS user with no active states", async () => {
    const result = await submit(submitEvent(ceRecordBody(), testReviewer));

    expect(result.statusCode).toBe(500);
    expect(mockedProducer.send).not.toHaveBeenCalled();
  });

  it("rejects an id prefix that does not match the selected state", async () => {
    const result = await submit(submitEvent(ceRecordBody({ state: "VA" })));

    expect(result.statusCode).toBe(500);
    expect(mockedProducer.send).not.toHaveBeenCalled();
  });

  it("rejects a duplicate initial id", async () => {
    const itemExists = vi.spyOn(packageApi, "itemExists").mockResolvedValue(true);
    restorers.push(() => itemExists.mockRestore());

    const result = await submit(submitEvent(ceRecordBody()));

    expect(result.statusCode).toBe(500);
    expect(mockedProducer.send).not.toHaveBeenCalled();
  });

  it("rejects subsequent documents when the package does not exist", async () => {
    const result = await submit(submitEvent(ceSubsequentBody()));

    expect(result.statusCode).toBe(500);
    expect(mockedProducer.send).not.toHaveBeenCalled();
  });

  it("does not publish when centraTopicName is missing", async () => {
    delete process.env.centraTopicName;

    const result = await submit(submitEvent(ceRecordBody()));

    expect(result.statusCode).toBe(500);
    expect(mockedProducer.send).not.toHaveBeenCalled();
  });
});
