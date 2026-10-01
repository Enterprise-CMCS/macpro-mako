import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { opensearch } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handleChipSpaAssignmentUpdated } from "./chipSpaAssignmentUpdated";
import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const PACKAGE_ID = "CA-26-1001";
const EXTERNAL_ID = "a0nTESTCHIP261001";
const CREATED_AT = "2026-10-01T16:00:00.000Z";
const emptySearch = { hits: { hits: [] } };

const members = [
  {
    srtAssignmentId: "assignment-cpoc",
    contactId: "contact-cpoc",
    fullName: "CHIP CPOC",
    email: "chip.cpoc@example.com",
    division: "DBC",
    group: "MBHPG",
    isCpoc: true,
    isConsultantSme: false,
    isActive: true,
    assignmentNotes: "Active CPOC",
  },
  {
    srtAssignmentId: "assignment-srt-1",
    contactId: "contact-srt-1",
    fullName: "CHIP SRT One",
    email: "chip.srt.one@example.com",
    division: "DMCP",
    group: "MCG",
    isCpoc: false,
    isConsultantSme: false,
    isActive: true,
    assignmentNotes: "Active SRT member",
  },
  {
    srtAssignmentId: "assignment-srt-2",
    contactId: "contact-srt-2",
    fullName: "CHIP SRT Two",
    email: "chip.srt.two@example.com",
    division: "DPO",
    group: "MCOG",
    isCpoc: false,
    isConsultantSme: true,
    isActive: true,
    assignmentNotes: "Active SRT member",
  },
  {
    srtAssignmentId: "assignment-inactive",
    contactId: "contact-inactive",
    fullName: "Former CHIP SRT",
    email: "former.chip.srt@example.com",
    division: null,
    group: null,
    isCpoc: false,
    isConsultantSme: false,
    isActive: false,
    assignmentNotes: null,
  },
];

const event = {
  spaWaiverId: EXTERNAL_ID,
  id: PACKAGE_ID,
  correlationId: "f1986220-4c79-48d4-88ea-cf52286546de",
  origin: "SMART",
  authority: "CHIP SPA",
  status: "Pending - First Clock",
  createdAt: CREATED_AT,
  operationType: "CHIPSPA_ASSIGNMENT_UPDATED",
  srtAssignmentId: "assignment-cpoc",
  srtMember: members,
} satisfies SmartOnemacEvent;

const packageDocument = {
  id: PACKAGE_ID,
  origin: "OneMAC",
  authority: "CHIP SPA",
  state: "CA",
  deleted: false,
  spaWaiverId: EXTERNAL_ID,
  correlationId: event.correlationId,
  leadAnalystName: "Previous CHIP CPOC",
  leadAnalystEmail: "previous.cpoc@example.com",
  reviewTeam: [{ name: "Previous CHIP SRT", email: "previous.srt@example.com" }],
  changedDate: "2026-10-01T15:00:00.000Z",
  makoChangedDate: "2026-10-01T15:00:00.000Z",
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

describe("handleChipSpaAssignmentUpdated", () => {
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

  it("projects one active CPOC and all active non-CPOC members into SRT", async () => {
    await handleChipSpaAssignmentUpdated(createContext());

    expect(updateItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      PACKAGE_ID,
      expect.objectContaining({
        leadAnalystName: "CHIP CPOC",
        leadAnalystEmail: "chip.cpoc@example.com",
        smartCpocContactId: "contact-cpoc",
        smartAssignmentChangedAt: CREATED_AT,
        reviewTeam: [
          { name: "CHIP SRT One", email: "chip.srt.one@example.com" },
          { name: "CHIP SRT Two", email: "chip.srt.two@example.com" },
        ],
        operationType: "CHIPSPA_ASSIGNMENT_UPDATED",
      }),
    );
    const updates = updateItemSpy.mock.calls[0][3];
    expect(updates.smartSrtRoster).toHaveLength(4);
    expect(updates.smartSrtRoster).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fullName: "Former CHIP SRT", isActive: false }),
      ]),
    );
  });

  it("replaces the prior snapshot when members are removed or reassigned", async () => {
    const replacementRoster = [
      { ...members[0], isCpoc: false },
      { ...members[1], isCpoc: true },
    ];
    await handleChipSpaAssignmentUpdated(
      createContext({
        event: {
          ...event,
          createdAt: "2026-10-01T16:05:00.000Z",
          srtMember: replacementRoster,
        } as SmartOnemacEvent,
      }),
    );

    const updates = updateItemSpy.mock.calls[0][3];
    expect(updates).toMatchObject({
      leadAnalystName: "CHIP SRT One",
      smartCpocContactId: "contact-srt-1",
      reviewTeam: [{ name: "CHIP CPOC", email: "chip.cpoc@example.com" }],
    });
    expect(updates.smartSrtRoster).toHaveLength(2);
    expect(updates.smartSrtRoster).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ fullName: "CHIP SRT Two" })]),
    );
  });

  it("does not let an older event overwrite a newer assignment snapshot", async () => {
    getItemSpy.mockResolvedValue(
      packageById({ smartAssignmentChangedAt: "2026-10-01T16:10:00.000Z" }),
    );

    await handleChipSpaAssignmentUpdated(createContext());

    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("rejects multiple active CPOCs without changing the package", async () => {
    await handleChipSpaAssignmentUpdated(
      createContext({
        event: {
          ...event,
          srtMember: members.map((member) => ({
            ...member,
            isCpoc: member.isActive && member.fullName !== "CHIP SRT Two",
          })),
        } as SmartOnemacEvent,
      }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(logErrorSpy).toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: "VALIDATION", kafkaKey: PACKAGE_ID }),
    );
  });

  it.each([
    ["authority", "Medicaid SPA"],
    ["operationType", "MSP_ASSIGNMENT_UPDATED"],
  ])("rejects an invalid %s contract value", async (field, value) => {
    await handleChipSpaAssignmentUpdated(
      createContext({ event: { ...event, [field]: value } as SmartOnemacEvent }),
    );

    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalled();
  });
});
