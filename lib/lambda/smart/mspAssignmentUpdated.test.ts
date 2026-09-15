import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch, SMART_RECORD_TYPE } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { handleMspAssignmentUpdated } from "./mspAssignmentUpdated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const PACKAGE_ID = "MD-26-0903-SG1";
const EXTERNAL_ID = "a0nTESTMD260903001";
const CREATED_AT = "2026-09-11T02:59:31.000Z";
const emptySearch = { hits: { hits: [] } };

const members = [
  {
    srtAssignmentId: "a0scp00000Du3DRAAZ",
    contactId: "003cp000017H4ZVAA0",
    fullName: "Test CPOC User",
    email: "patrick.spriggs@emailicf.com",
    division: "DEPO",
    group: "CAHPG",
    isCpoc: true,
    isConsultantSme: false,
    isActive: true,
    assignmentNotes: null,
  },
  {
    srtAssignmentId: "a0scp00000Du3DSAAZ",
    contactId: "003cp00000insUAAAY",
    fullName: "Test SRT User",
    email: "srt@example.com",
    division: "DEPO",
    group: "CAHPG",
    isCpoc: false,
    isConsultantSme: false,
    isActive: true,
    assignmentNotes: "Test",
  },
  {
    srtAssignmentId: "a0scp00000DuEAVAA3",
    contactId: "003cp00000jILiXAAW",
    fullName: "Inactive SME",
    email: "sme@example.com",
    division: null,
    group: "DSG",
    isCpoc: false,
    isConsultantSme: true,
    isActive: false,
    assignmentNotes: null,
  },
];

const event = {
  spaWaiverId: EXTERNAL_ID,
  id: PACKAGE_ID,
  correlationId: "84156035-5aff-4a0c-b9c3-42f90d633f35",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Pending - First Clock",
  createdAt: CREATED_AT,
  operationType: "MSP_ASSIGNMENT_UPDATED",
  srtAssignmentId: "a0scp00000DuEAVAA3",
  srtMember: members,
} satisfies SmartOnemacEvent;

const packageDocument = {
  id: PACKAGE_ID,
  origin: "OneMAC",
  authority: "Medicaid SPA",
  state: "MD",
  deleted: false,
  spaWaiverId: EXTERNAL_ID,
  correlationId: event.correlationId,
  leadAnalystName: "Legacy Analyst",
  leadAnalystEmail: "legacy@example.com",
  leadAnalystOfficerId: 3539,
  reviewTeam: [{ name: "Legacy Analyst", email: "legacy@example.com" }],
  changedDate: "2026-09-11T04:00:00.000Z",
  makoChangedDate: "2026-09-11T04:00:00.000Z",
} as opensearch.main.Document;

const packageById = (
  overrides: Partial<opensearch.main.Document> = {},
): Awaited<ReturnType<typeof os.getItem>> =>
  ({
    found: true,
    _id: PACKAGE_ID,
    _source: { ...packageDocument, ...overrides },
  }) as Awaited<ReturnType<typeof os.getItem>>;

const packageSearch = (
  overrides: Partial<opensearch.main.Document> = {},
): Awaited<ReturnType<typeof os.search>> =>
  ({
    hits: { hits: [{ _id: PACKAGE_ID, _source: { ...packageDocument, ...overrides } }] },
  }) as Awaited<ReturnType<typeof os.search>>;

const createContext = (
  overrides: Partial<SmartOnemacEventContext> = {},
): SmartOnemacEventContext => ({
  event,
  existence: {
    mainById: packageById(),
    mainBySpaWaiverId: packageSearch(),
    changelogById: emptySearch,
  },
  topicPartition: "aws.mulesoft.onemac.events-0",
  kafkaKey: PACKAGE_ID,
  kafkaOffset: 42,
  kafkaTimestamp: Date.parse(CREATED_AT),
  ...overrides,
});

const getItemSpy = vi.spyOn(os, "getItem");
const createItemSpy = vi.spyOn(os, "createItem");
const updateItemSpy = vi.spyOn(os, "updateItem");
const logErrorSpy = vi.spyOn(sink, "logError").mockImplementation(() => undefined);
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);

describe("handleMspAssignmentUpdated", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.osDomain = "https://search.example.test";
    process.env.indexNamespace = "test-";
    getItemSpy.mockResolvedValue(packageById());
    createItemSpy.mockResolvedValue({ created: true });
    updateItemSpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
  });

  it("replaces the legacy roster with the complete active SMART roster and CPOC", async () => {
    await handleMspAssignmentUpdated(createContext());

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      expect.objectContaining({
        leadAnalystName: "Test CPOC User",
        leadAnalystEmail: "patrick.spriggs@emailicf.com",
        leadAnalystOfficerId: null,
        smartCpocContactId: "003cp000017H4ZVAA0",
        smartAssignmentChangedAt: CREATED_AT,
        // A later assignment event does not roll back newer package activity.
        makoChangedDate: "2026-09-11T04:00:00.000Z",
        reviewTeam: [
          { name: "Test CPOC User", email: "patrick.spriggs@emailicf.com" },
          { name: "Test SRT User", email: "srt@example.com" },
        ],
      }),
    );
    const updates = updateItemSpy.mock.calls[0][3];
    expect(updates.smartSrtRoster).toHaveLength(3);
    expect(updates.smartSrtRoster).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fullName: "Inactive SME", isActive: false }),
      ]),
    );
  });

  it("changes and clears the CPOC from a complete roster snapshot", async () => {
    const changedMembers = members.map((member) => ({
      ...member,
      isCpoc: member.fullName === "Test SRT User",
    }));
    await handleMspAssignmentUpdated(
      createContext({ event: { ...event, srtMember: changedMembers } as SmartOnemacEvent }),
    );
    expect(updateItemSpy.mock.calls[0][3]).toMatchObject({
      leadAnalystName: "Test SRT User",
      smartCpocContactId: "003cp00000insUAAAY",
    });

    updateItemSpy.mockClear();
    await handleMspAssignmentUpdated(
      createContext({
        event: {
          ...event,
          createdAt: "2026-09-11T03:00:00.000Z",
          srtMember: changedMembers.map((member) => ({ ...member, isCpoc: false })),
        } as SmartOnemacEvent,
      }),
    );
    expect(updateItemSpy.mock.calls[0][3]).toMatchObject({
      leadAnalystName: null,
      leadAnalystEmail: null,
      smartCpocContactId: null,
    });
  });

  it("treats each isActive flag as the member's current state", async () => {
    await handleMspAssignmentUpdated(
      createContext({
        event: {
          ...event,
          srtMember: members.map((member) => ({
            ...member,
            isActive: member.fullName !== "Test SRT User",
          })),
        } as SmartOnemacEvent,
      }),
    );
    expect(updateItemSpy.mock.calls[0][3]).toMatchObject({
      reviewTeam: [
        { name: "Test CPOC User", email: "patrick.spriggs@emailicf.com" },
        { name: "Inactive SME", email: "sme@example.com" },
      ],
    });
  });

  it("ignores stale and identical replayed snapshots", async () => {
    await handleMspAssignmentUpdated(createContext());
    const appliedRoster = updateItemSpy.mock.calls[0][3].smartSrtRoster as NonNullable<
      opensearch.main.Document["smartSrtRoster"]
    >;
    updateItemSpy.mockClear();

    getItemSpy.mockResolvedValue(
      packageById({
        smartAssignmentChangedAt: CREATED_AT,
        smartSrtRoster: appliedRoster,
      }),
    );
    await handleMspAssignmentUpdated(createContext());
    expect(updateItemSpy).not.toHaveBeenCalled();

    getItemSpy.mockResolvedValue(
      packageById({
        smartAssignmentChangedAt: "2026-09-11T03:00:00.000Z",
        smartSrtRoster: appliedRoster,
      }),
    );
    await handleMspAssignmentUpdated(createContext());
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("rejects conflicting snapshots at the same timestamp", async () => {
    getItemSpy.mockResolvedValue(
      packageById({ smartAssignmentChangedAt: CREATED_AT, smartSrtRoster: [] }),
    );
    await handleMspAssignmentUpdated(createContext());
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", kafkaKey: PACKAGE_ID }),
    );
  });

  it("creates a hidden reservation if assignment arrives before a package", async () => {
    getItemSpy.mockResolvedValue(
      packageById({ origin: "SMART", smartRecordType: SMART_RECORD_TYPE.RESERVATION }),
    );
    await handleMspAssignmentUpdated(
      createContext({
        existence: {
          mainById: undefined,
          mainBySpaWaiverId: emptySearch,
          changelogById: emptySearch,
        },
      }),
    );
    expect(createItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      expect.objectContaining({ smartRecordType: SMART_RECORD_TYPE.RESERVATION }),
    );
    expect(updateItemSpy.mock.calls[0][3]).toMatchObject({ leadAnalystName: "Test CPOC User" });
  });

  it("rejects invalid rosters without persisting a package", async () => {
    await handleMspAssignmentUpdated(
      createContext({
        event: {
          ...event,
          srtMember: [members[0], { ...members[1], srtAssignmentId: members[0].srtAssignmentId }],
        } as SmartOnemacEvent,
      }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalled();
    expect(logErrorSpy).toHaveBeenCalled();
  });

  it("rejects two active CPOCs and non-snapshot assignment payloads", async () => {
    await handleMspAssignmentUpdated(
      createContext({
        event: {
          ...event,
          srtMember: members.map((member) => ({ ...member, isCpoc: member.isActive })),
        } as SmartOnemacEvent,
      }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();

    await handleMspAssignmentUpdated(createContext({ event: { ...event, srtMember: members[0] } }));
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledTimes(2);
  });
});
