import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { isActiveMainNonDraftPackage } from "libs/api/package/packageStatus";
import { getStatus, SEATOOL_STATUS } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";
import { describe, expect, it } from "vitest";

import { getStateFromPackageId, transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

const createdAt = "2026-08-17T16:54:33.000Z";
const event = Object.freeze({
  spaWaiverId: "a0ncp000006Wdh7AAC",
  id: "AL-26-0817-0001",
  correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Intake Needed",
  createdAt,
  createdByUserId: "005cp00000Jqq9HAAR",
  createdByName: "Alice Jones",
  createdByEmail: "alice.j@globalalliantinc.com",
  operationType: "MSP_MANUAL_RECORD_CREATED",
  creationContext: "MANUAL",
  state: "Alabama",
  initialSubmissionDate: "2026-08-17",
} satisfies SmartOnemacEvent);

const { cmsStatus, stateStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);

describe("transformMspManualRecordCreated", () => {
  it("creates a OneMAC-shaped SMART main-index reservation", () => {
    const transformed = transformMspManualRecordCreated(event);

    expect(transformed).toMatchObject({
      id: "AL-26-0817-0001",
      origin: "SMART",
      authority: "Medicaid SPA",
      deleted: false,
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      cmsStatus,
      stateStatus,
      initialIntakeNeeded: true,
      spaWaiverId: "a0ncp000006Wdh7AAC",
      correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
      operationType: "MSP_MANUAL_RECORD_CREATED",
      creationContext: "MANUAL",
      createdByUserId: "005cp00000Jqq9HAAR",
    });
  });

  it("derives the state from the normalized ID and maps dates and submitter fields", () => {
    const transformed = transformMspManualRecordCreated(event);
    const transformedLowercaseId = transformMspManualRecordCreated({
      ...event,
      id: event.id.toLowerCase(),
    });

    expect(transformed).toMatchObject({
      state: "AL",
      submissionDate: createdAt,
      makoChangedDate: createdAt,
      changedDate: createdAt,
      statusDate: createdAt,
      submitterName: "Alice Jones",
      submitterEmail: "alice.j@globalalliantinc.com",
    });
    expect(transformedLowercaseId).toMatchObject({
      id: "AL-26-0817-0001",
      state: "AL",
    });
    expect(transformed?.state).not.toBe(event.state);
    expect(transformed).not.toHaveProperty("proposedDate");
  });

  it("defaults submitter fields to empty strings when Kafka omits them", () => {
    const transformed = transformMspManualRecordCreated({
      ...event,
      createdByName: undefined,
      createdByEmail: undefined,
      createdByUserId: undefined,
    });

    expect(transformed).toMatchObject({
      submitterName: "",
      submitterEmail: "",
    });
    expect(transformed).not.toHaveProperty("createdByUserId");
  });

  it("requires the ID prefix to be a known two-letter state code", () => {
    expect(getStateFromPackageId("al-26-0817-0001")).toBe("AL");
    expect(getStateFromPackageId("XX-26-0817-0001")).toBeUndefined();
    expect(transformMspManualRecordCreated({ ...event, id: "XX-26-0817-0001" })).toBeUndefined();
  });

  it("blocks package ID reuse through the real non-draft package helper", () => {
    const transformed = transformMspManualRecordCreated(event);

    expect(
      isActiveMainNonDraftPackage({
        found: true,
        _source: transformed,
      } as unknown as ItemResult),
    ).toBe(true);
  });

  it("is deterministic, does not mutate its input, and has no service-client imports", () => {
    const originalEvent = { ...event };

    expect(transformMspManualRecordCreated(event)).toEqual(transformMspManualRecordCreated(event));
    expect(event).toEqual(originalEvent);

    const moduleSource = readFileSync(
      fileURLToPath(new URL("./mspManualRecordCreated.ts", import.meta.url)),
      "utf8",
    );
    expect(moduleSource).not.toMatch(
      /(?:from\s+|import\s*\()\s*["'][^"']*(?:opensearch|cloudwatch)/i,
    );
  });
});
