import * as packageApi from "libs/api/package";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { isHiddenSmartReservation } from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dispatchSmartOnemacEvent } from "./dispatchSmartOnemacEvent";
import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleMspSplitSpaCreated } from "./mspSplitSpaCreated";
import * as errors from "./publishSmartIngestError";

const ORIGINAL_ID = "OH-26-1123";
const SPLIT_ID = `${ORIGINAL_ID}-A`;
const ORIGINAL_EXTERNAL_ID = "smart-parent";
const SPLIT_EXTERNAL_ID = "smart-child";
const CREATED_AT = "2026-11-23T18:00:00.000Z";
const TIMESTAMP = Date.parse(CREATED_AT);
const emptySearch = { hits: { hits: [] } };
type PackageResult = NonNullable<Awaited<ReturnType<typeof os.getItem>>>;
const item = (document: Record<string, unknown>): PackageResult =>
  ({
    found: true,
    _id: document.id,
    _source: document,
    _seq_no: 4,
    _primary_term: 1,
  }) as unknown as PackageResult;

const searchSpy = vi.spyOn(os, "search");
const createSpy = vi.spyOn(os, "createItem");
const getSpy = vi.spyOn(os, "getItem");
const updateSpy = vi.spyOn(os, "updateItem");
const bulkSpy = vi.spyOn(os, "bulkUpdateData");
const historySpy = vi.spyOn(packageApi, "getPackageChangelog");
const errorSpy = vi.spyOn(errors, "publishSmartIngestError");
vi.spyOn(sink, "logError").mockImplementation(() => undefined);

describe.each(["Medicaid SPA", "CHIP SPA"] as const)(
  "SMART split safeguards for %s",
  (authority) => {
    const event = {
      authority,
      id: SPLIT_ID,
      spaWaiverId: SPLIT_EXTERNAL_ID,
      originalSpaId: ORIGINAL_ID,
      originalSpaWaiverId: ORIGINAL_EXTERNAL_ID,
      splitSpaId: SPLIT_ID,
      splitSpaWaiverId: SPLIT_EXTERNAL_ID,
      splitReason: "Separate the eligibility provisions",
      origin: "SMART",
      operationType: "MSP_SPLIT_SPA_CREATED",
      status: "Intake Needed",
      correlationId: "split-event",
      createdAt: CREATED_AT,
      createdByName: "Example CMS User",
      createdByEmail: "cms@example.com",
    } satisfies SmartOnemacEventContext["event"];
    let parent: Record<string, unknown>;
    const context = (target?: PackageResult): SmartOnemacEventContext => ({
      event,
      topicPartition: "aws.mulesoft.onemac.events-0",
      existence: {
        mainById: target,
        mainBySpaWaiverId: emptySearch,
        changelogById: emptySearch,
      },
    });
    const reservation = (overrides: Record<string, unknown> = {}) =>
      item({
        id: SPLIT_ID,
        authority,
        origin: "SMART",
        spaWaiverId: SPLIT_EXTERNAL_ID,
        smartRecordType: SMART_RECORD_TYPE.RESERVATION,
        deleted: false,
        ...overrides,
      });
    const parentResult = () => ({ hits: { hits: [{ _id: ORIGINAL_ID, _source: parent }] } });

    beforeEach(() => {
      vi.stubEnv("osDomain", "https://search.example.test");
      vi.stubEnv("indexNamespace", "test-");
      parent = {
        id: ORIGINAL_ID,
        spaWaiverId: ORIGINAL_EXTERNAL_ID,
        authority,
        origin: "OneMAC",
        deleted: false,
        state: "OH",
        seatoolStatus: SEATOOL_STATUS.PENDING,
        cmsStatus: "Pending",
        stateStatus: "Under Review",
        secondClock: true,
        initialIntakeNeeded: false,
        locked: false,
        submissionDate: "2026-11-01T15:22:33.123Z",
        proposedDate: "2027-01-01T00:00:00.000Z",
        approvedEffectiveDate: null,
        raiRequestedDate: "2026-11-02T05:00:00.000Z",
        raiReceivedDate: "2026-11-03T17:22:00.123Z",
        statusDate: "2026-11-03T05:00:00.000Z",
        subject: "Parent subject",
        description: "Parent description",
        leadAnalystName: "Parent CPOC",
        reviewTeam: [{ name: "Parent SRT", email: "parent@example.com" }],
      };
      searchSpy.mockReset().mockImplementation(async () => parentResult());
      createSpy.mockReset().mockResolvedValue({ created: true });
      getSpy.mockReset().mockResolvedValue(undefined);
      updateSpy.mockReset().mockResolvedValue(undefined);
      bulkSpy.mockReset().mockResolvedValue(undefined);
      historySpy
        .mockReset()
        .mockResolvedValue({ hits: { hits: [] } } as unknown as opensearch.changelog.Response);
      errorSpy.mockReset().mockResolvedValue(undefined);
    });
    afterEach(() => vi.unstubAllEnvs());

    it.each([
      [SEATOOL_STATUS.PENDING, "Pending", "Under Review"],
      [SEATOOL_STATUS.PENDING_RAI, "Pending - RAI", "RAI Issued"],
      [SEATOOL_STATUS.APPROVED, "Approved", "Approved"],
    ])(
      "inherits %s and business dates without changing the parent",
      async (status, cmsStatus, stateStatus) => {
        Object.assign(parent, { seatoolStatus: status, cmsStatus, stateStatus });
        const original = structuredClone(parent);

        await handleMspSplitSpaCreated(context());

        const child = createSpy.mock.calls[0][2];
        expect(child).toMatchObject({
          authority,
          id: SPLIT_ID,
          spaWaiverId: SPLIT_EXTERNAL_ID,
          originalSpaWaiverId: ORIGINAL_EXTERNAL_ID,
          origin: "SMART",
          smartRecordType: SMART_RECORD_TYPE.PACKAGE,
          state: "OH",
          seatoolStatus: status,
          cmsStatus,
          stateStatus,
          secondClock: true,
          submissionDate: parent.submissionDate,
          proposedDate: parent.proposedDate,
          approvedEffectiveDate: null,
          raiReceivedDate: parent.raiReceivedDate,
          subject: parent.subject,
          description: parent.description,
          leadAnalystName: parent.leadAnalystName,
          reviewTeam: parent.reviewTeam,
          makoChangedDate: TIMESTAMP,
        });
        expect(isHiddenSmartReservation(child as Partial<opensearch.main.Document>)).toBe(false);
        expect(parent).toEqual(original);
        expect(updateSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
      },
    );

    it("uses the existing admin format with split boilerplate and the SMART timestamp", async () => {
      await handleMspSplitSpaCreated(context());

      expect(bulkSpy).toHaveBeenCalledWith(
        expect.anything(),
        "test-changelog",
        [
          expect.objectContaining({
            id: `${SPLIT_ID}-smart-split-${SPLIT_EXTERNAL_ID}`,
            packageId: SPLIT_ID,
            event: "split-spa",
            ...(authority === "CHIP SPA" ? { changeType: "Manual Update" } : {}),
            authority,
            operationType: "MSP_SPLIT_SPA_CREATED",
            timestamp: TIMESTAMP,
            isAdminChange: true,
            changeMade: `${SPLIT_ID} was manually added to OneMAC.`,
            changeReason: `This package was added to OneMAC from SMART. Package was split from SPA ${ORIGINAL_ID} by ${event.createdByName}. Reason: ${event.splitReason}`,
          }),
        ],
        { throwOnBulkError: true },
      );
    });

    it("keeps parent event versions separate from the child's freshness checks", async () => {
      Object.assign(parent, {
        smartStatusChangedAt: "2026-11-24T18:00:00.000Z",
        smartAssignmentChangedAt: "2026-11-24T18:00:00.000Z",
        smartPackageDetailsChangedAt: "2026-11-24T18:00:00.000Z",
        smartPackageDetailsPreviousId: "OH-26-OLDER-ID",
      });

      await handleMspSplitSpaCreated(context());

      const child = createSpy.mock.calls[0][2];
      expect(child).toMatchObject({ stateStatus: parent.stateStatus, subject: parent.subject });
      expect(child).not.toHaveProperty("smartStatusChangedAt");
      expect(child).not.toHaveProperty("smartAssignmentChangedAt");
      expect(child).not.toHaveProperty("smartPackageDetailsChangedAt");
      expect(child).not.toHaveProperty("smartPackageDetailsPreviousId");
    });

    it("links an untouched parent by ID without replacing its business fields", async () => {
      delete parent.spaWaiverId;
      searchSpy.mockResolvedValueOnce(emptySearch);
      getSpy.mockResolvedValueOnce(item(parent));

      await handleMspSplitSpaCreated(context());

      expect(updateSpy).toHaveBeenCalledWith(expect.anything(), "test-main", ORIGINAL_ID, {
        spaWaiverId: ORIGINAL_EXTERNAL_ID,
      });
      expect(createSpy).toHaveBeenCalledOnce();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it.each([
      { authority: "1915(b)" },
      { authority: authority === "CHIP SPA" ? "Medicaid SPA" : "CHIP SPA" },
      { deleted: true },
      { origin: "SMART", smartRecordType: SMART_RECORD_TYPE.RESERVATION },
    ])("rejects an ineligible parent: %j", async (overrides) => {
      Object.assign(parent, overrides);
      await handleMspSplitSpaCreated(context());
      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ errorCode: "VALIDATION" }));
      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(bulkSpy).not.toHaveBeenCalled();
    });

    it.each([
      { authority: authority === "CHIP SPA" ? "Medicaid SPA" : "CHIP SPA" },
      { deleted: true },
      { spaWaiverId: "another-child" },
    ])("rejects an incompatible child reservation: %j", async (overrides) => {
      await handleMspSplitSpaCreated(context(reservation(overrides)));
      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ errorCode: "VALIDATION" }));
      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(bulkSpy).not.toHaveBeenCalled();
    });

    it("rejects reuse of the parent's external ID for the child", async () => {
      const invalid = context();
      invalid.event = { ...event, originalSpaWaiverId: SPLIT_EXTERNAL_ID };
      await handleMspSplitSpaCreated(invalid);
      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ errorCode: "VALIDATION" }));
      expect(searchSpy).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("promotes a plain reservation using parent data instead of reservation defaults", async () => {
      await handleMspSplitSpaCreated(
        context(
          reservation({
            submissionDate: CREATED_AT,
            stateStatus: "Submitted",
            cmsStatus: "Submitted - Intake Needed",
            secondClock: false,
            initialIntakeNeeded: true,
          }),
        ),
      );
      expect(updateSpy).toHaveBeenCalledWith(
        expect.anything(),
        "test-main",
        SPLIT_ID,
        expect.objectContaining({
          smartRecordType: SMART_RECORD_TYPE.PACKAGE,
          submissionDate: parent.submissionDate,
          stateStatus: "Under Review",
          cmsStatus: "Pending",
          initialIntakeNeeded: false,
          secondClock: true,
        }),
        { ifSeqNo: 4, ifPrimaryTerm: 1 },
      );
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("preserves child status, assignments, and details received before the split", async () => {
      const changedAt = "2026-11-23T17:59:59.000Z";
      const childSnapshot = {
        smartStatusChangedAt: changedAt,
        smartStatus: "Pending RAI",
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        cmsStatus: "Pending - RAI",
        stateStatus: "RAI Issued",
        statusDate: "2026-11-23T05:00:00.000Z",
        secondClock: false,
        raiReceivedDate: null,
        smartAssignmentChangedAt: changedAt,
        smartSrtRoster: [],
        leadAnalystName: null,
        leadAnalystEmail: null,
        smartCpocContactId: null,
        reviewTeam: [],
        smartPackageDetailsChangedAt: changedAt,
        subject: "Child subject",
        description: null,
        submissionDate: "2026-11-04T05:00:00.000Z",
        types: [],
        subTypes: [],
      };
      await handleMspSplitSpaCreated(context(reservation(childSnapshot)));
      expect(updateSpy).toHaveBeenCalledWith(
        expect.anything(),
        "test-main",
        SPLIT_ID,
        expect.objectContaining({ ...childSnapshot, smartRecordType: SMART_RECORD_TYPE.PACKAGE }),
        { ifSeqNo: 4, ifPrimaryTerm: 1 },
      );
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("uses a reservation that wins the create race and retains its newer child data", async () => {
      createSpy.mockResolvedValueOnce({ created: false, reason: "version_conflict" });
      getSpy.mockResolvedValueOnce(
        reservation({
          smartAssignmentChangedAt: "2026-11-23T18:01:00.000Z",
          leadAnalystName: "Child CPOC",
          reviewTeam: [{ name: "Child SRT", email: "child@example.com" }],
          changedDate: "2026-11-23T18:01:00.000Z",
        }),
      );
      await handleMspSplitSpaCreated(context());
      expect(updateSpy).toHaveBeenCalledWith(
        expect.anything(),
        "test-main",
        SPLIT_ID,
        expect.objectContaining({
          leadAnalystName: "Child CPOC",
          reviewTeam: [{ name: "Child SRT", email: "child@example.com" }],
          changedDate: Date.parse("2026-11-23T18:01:00.000Z"),
        }),
        { ifSeqNo: 4, ifPrimaryTerm: 1 },
      );
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("rejects a different authority that wins the child create race", async () => {
      createSpy.mockResolvedValueOnce({ created: false, reason: "version_conflict" });
      getSpy.mockResolvedValueOnce(reservation({ authority: "1915(b)" }));
      await handleMspSplitSpaCreated(context());
      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ errorCode: "VALIDATION" }));
      expect(updateSpy).not.toHaveBeenCalled();
      expect(bulkSpy).not.toHaveBeenCalled();
    });

    it("retries a concurrent reservation update instead of overwriting it", async () => {
      updateSpy.mockRejectedValueOnce(new Error("version_conflict_engine_exception"));
      await expect(handleMspSplitSpaCreated(context(reservation()))).rejects.toThrow(
        "version_conflict_engine_exception",
      );
      expect(bulkSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it.each(["before", "after"])(
      "retains real child status and assignment projections arriving %s the split",
      async (order) => {
        let child: Record<string, unknown> | undefined;
        let version = 0;
        const result = () => (child ? { ...item(child), _seq_no: version } : undefined);
        getSpy.mockImplementation(async (_domain, _index, id) =>
          id === SPLIT_ID ? result() : item(parent),
        );
        searchSpy.mockImplementation(async (_domain, index, query) => {
          if (index.endsWith("changelog")) return emptySearch;
          if (JSON.stringify(query).includes(ORIGINAL_EXTERNAL_ID)) return parentResult();
          return child ? { hits: { hits: [{ _id: SPLIT_ID, _source: child }] } } : emptySearch;
        });
        createSpy.mockImplementation(async (_domain, _index, document) => {
          child = { ...document };
          version++;
          return { created: true };
        });
        updateSpy.mockImplementation(async (_domain, _index, id, updates, options) => {
          expect(id).toBe(SPLIT_ID);
          if (options && options.ifSeqNo !== version) throw new Error("version conflict");
          child = { ...child, ...updates };
          version++;
        });
        const consume = (payload: SmartOnemacEventContext["event"]) =>
          dispatchSmartOnemacEvent(payload, { topicPartition: "aws.mulesoft.onemac.events-0" });
        const consumeChildUpdates = async () => {
          await consume({
            ...event,
            correlationId: "child-status-event",
            createdAt: "2026-11-23T17:59:58.000Z",
            operationType: "MSP_STATUS_UPDATED",
            status: "Pending RAI",
            statusChangedAt: "2026-11-23T17:59:58.000Z",
            statusDate: "2026-11-23",
            rai: { formalRaiRequested: true, raiRequestedDate: "2026-11-23" },
          });
          await consume({
            ...event,
            correlationId: "child-assignment-event",
            createdAt: "2026-11-23T17:59:59.000Z",
            operationType: "MSP_ASSIGNMENT_UPDATED",
            srtMember: [
              {
                srtAssignmentId: "child-cpoc",
                fullName: "Child CPOC",
                email: "cpoc@example.com",
                isCpoc: true,
                isActive: true,
                isConsultantSme: false,
              },
              {
                srtAssignmentId: "child-srt",
                fullName: "Child SRT",
                email: "srt@example.com",
                isCpoc: false,
                isActive: true,
                isConsultantSme: false,
              },
            ],
          });
        };

        if (order === "before") {
          await consumeChildUpdates();
          expect(isHiddenSmartReservation(child)).toBe(true);
        }
        await consume(event);
        if (order === "after") await consumeChildUpdates();

        const updatesBeforeReplay = updateSpy.mock.calls.length;
        await consume(event);
        expect(updateSpy).toHaveBeenCalledTimes(updatesBeforeReplay);

        expect(child).toMatchObject({
          authority,
          id: SPLIT_ID,
          origin: "SMART",
          smartRecordType: SMART_RECORD_TYPE.PACKAGE,
          stateStatus: "RAI Issued",
          cmsStatus: "Pending - RAI",
          secondClock: false,
          raiReceivedDate: null,
          submissionDate: parent.submissionDate,
          leadAnalystName: "Child CPOC",
          reviewTeam: [{ name: "Child SRT", email: "srt@example.com" }],
        });
        expect(errorSpy).not.toHaveBeenCalled();
      },
    );

    it("accepts a split replay after later child status updates without reverting them", async () => {
      const completed = item({
        ...parent,
        id: SPLIT_ID,
        origin: "SMART",
        smartRecordType: SMART_RECORD_TYPE.PACKAGE,
        spaWaiverId: SPLIT_EXTERNAL_ID,
        splitSpaId: SPLIT_ID,
        splitSpaWaiverId: SPLIT_EXTERNAL_ID,
        originalSpaId: ORIGINAL_ID,
        originalSpaWaiverId: ORIGINAL_EXTERNAL_ID,
        correlationId: event.correlationId,
        operationType: "MSP_STATUS_UPDATED",
        stateStatus: "RAI Issued",
        smartStatusChangedAt: "2026-11-24T18:00:00.000Z",
      });
      await handleMspSplitSpaCreated(context(completed));
      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(bulkSpy).toHaveBeenCalledOnce();
    });
  },
);
