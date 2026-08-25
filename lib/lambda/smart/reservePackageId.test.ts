import * as os from "libs/opensearch-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { reservePackageId } from "./reservePackageId";

const incomingEvent = Object.freeze({
  spaWaiverId: "a0ncp000006Wdh7AAC",
  id: "AL-26-0817-0001",
  correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Intake Needed",
  createdAt: "2026-08-17T16:54:33.000Z",
  createdByUserId: "005cp00000Jqq9HAAR",
  createdByName: "Alice Jones",
  createdByEmail: "alice.j@globalalliantinc.com",
  operationType: "MSP_MANUAL_RECORD_CREATED",
  creationContext: "MANUAL",
  state: "Alabama",
  initialSubmissionDate: "2026-08-17",
} satisfies SmartOnemacEvent);

const reservationDocument = transformMspManualRecordCreated(incomingEvent)!;
const getItemSpy = vi.spyOn(os, "getItem");
const createItemSpy = vi.spyOn(os, "createItem");
const updateItemSpy = vi.spyOn(os, "updateItem");
const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");

const smartIdentityFields = {
  correlationId: incomingEvent.correlationId,
  spaWaiverId: incomingEvent.spaWaiverId,
};

describe("reservePackageId", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.osDomain = "https://search.example.test";
    process.env.indexNamespace = "test-";

    getItemSpy.mockResolvedValue(undefined);
    createItemSpy.mockResolvedValue({ created: true });
    updateItemSpy.mockResolvedValue(undefined);
    bulkUpdateDataSpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
  });

  it("writes one reservation keyed by the event ID when the main-index ID is missing", async () => {
    await reservePackageId(reservationDocument, incomingEvent);

    expect(getItemSpy).toHaveBeenCalledOnce();
    expect(getItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      incomingEvent.id,
    );
    expect(createItemSpy).toHaveBeenCalledOnce();
    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({ ...reservationDocument, id: incomingEvent.id }),
    );
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it.each(["OneMAC", "SEATool"])(
    "always overwrites SMART identity fields when a package from %s already uses the ID",
    async (existingOrigin) => {
      getItemSpy.mockResolvedValueOnce({
        found: true,
        _id: incomingEvent.id,
        _source: {
          id: incomingEvent.id,
          origin: existingOrigin,
          seatoolStatus: "Under Review",
        },
      } as Awaited<ReturnType<typeof os.getItem>>);

      await reservePackageId(reservationDocument, incomingEvent);

      expect(createItemSpy).not.toHaveBeenCalled();
      expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).toHaveBeenCalledOnce();
      expect(updateItemSpy).toHaveBeenCalledWith(
        "https://search.example.test",
        "test-main",
        incomingEvent.id,
        smartIdentityFields,
      );
      expect(updateItemSpy.mock.calls[0][3]).toEqual(smartIdentityFields);
      expect(updateItemSpy.mock.calls[0][3]).not.toHaveProperty("origin");
      expect(updateItemSpy.mock.calls[0][3]).not.toHaveProperty("seatoolStatus");
      expect(updateItemSpy.mock.calls[0][3]).not.toHaveProperty("createdByUserId");
    },
  );

  it("overwrites identity fields that already exist on the package", async () => {
    getItemSpy.mockResolvedValueOnce({
      found: true,
      _id: incomingEvent.id,
      _source: {
        id: incomingEvent.id,
        origin: "OneMAC",
        seatoolStatus: "Under Review",
        correlationId: "existing-correlation",
        spaWaiverId: "existing-spa-waiver",
      },
    } as Awaited<ReturnType<typeof os.getItem>>);

    await reservePackageId(reservationDocument, incomingEvent);

    expect(updateItemSpy).toHaveBeenCalledOnce();
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      incomingEvent.id,
      smartIdentityFields,
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("overwrites identity fields when create reports a version conflict", async () => {
    createItemSpy.mockResolvedValueOnce({ created: false, reason: "version_conflict" });

    await reservePackageId(reservationDocument, incomingEvent);

    expect(createItemSpy).toHaveBeenCalledOnce();
    expect(updateItemSpy).toHaveBeenCalledOnce();
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      incomingEvent.id,
      smartIdentityFields,
    );
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("rethrows OpenSearch failures that are not collisions", async () => {
    const outage = new Error("OpenSearch unavailable");
    createItemSpy.mockRejectedValueOnce(outage);

    await expect(reservePackageId(reservationDocument, incomingEvent)).rejects.toThrow(outage);
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });

  it("rethrows identity-field overwrite failures on an existing package", async () => {
    const outage = new Error("OpenSearch update failed");
    getItemSpy.mockResolvedValueOnce({
      found: true,
      _id: incomingEvent.id,
      _source: {
        id: incomingEvent.id,
        origin: "OneMAC",
      },
    } as Awaited<ReturnType<typeof os.getItem>>);
    updateItemSpy.mockRejectedValueOnce(outage);

    await expect(reservePackageId(reservationDocument, incomingEvent)).rejects.toThrow(outage);
    expect(bulkUpdateDataSpy).not.toHaveBeenCalled();
  });
});
