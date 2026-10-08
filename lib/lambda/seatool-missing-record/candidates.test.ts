import { Authority, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { describe, expect, it } from "vitest";

import {
  groupCandidatesByMailbox,
  isMissingRecordCandidate,
  MissingRecordCandidate,
  MissingRecordSource,
  toMissingRecordCandidate,
} from "./candidates";

const NOW = new Date("2023-08-05T12:00:00-04:00");

function source(overrides: MissingRecordSource = {}): MissingRecordSource {
  return {
    id: "MD-23-0001",
    submissionDate: "2023-08-01T12:00:00-04:00",
    authority: Authority.MED_SPA,
    origin: "OneMAC",
    deleted: false,
    actionType: "New",
    seatoolStatus: SEATOOL_STATUS.SUBMITTED,
    cmsStatus: "Submitted - Intake Needed",
    changedDate: "2023-08-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("seatool missing-record candidates", () => {
  it("includes Submitted OneMAC packages missing changed_date at day 4+", () => {
    const candidate = toMissingRecordCandidate(source(), NOW);

    expect(isMissingRecordCandidate(source())).toBe(true);
    expect(candidate).toEqual({
      id: "MD-23-0001",
      submissionDate: "2023-08-01T12:00:00-04:00",
      authority: Authority.MED_SPA,
      daysSinceSubmit: 4,
    });
  });

  it("excludes temporary extensions", () => {
    expect(isMissingRecordCandidate(source({ actionType: "Extend" }))).toBe(false);
    expect(
      toMissingRecordCandidate(source({ actionType: "temporary-extension" }), NOW),
    ).toBeUndefined();
    expect(toMissingRecordCandidate(source({ event: "temporary-extension" }), NOW)).toBeUndefined();
  });

  it("excludes drafts, deleted records, SMART reservations, and SEA Tool ingest markers", () => {
    expect(isMissingRecordCandidate(source({ seatoolStatus: SEATOOL_STATUS.DRAFT }))).toBe(false);
    expect(isMissingRecordCandidate(source({ deleted: true }))).toBe(false);
    expect(isMissingRecordCandidate(source({ origin: "SMART" }))).toBe(false);
    expect(
      isMissingRecordCandidate(source({ smartRecordType: SMART_RECORD_TYPE.RESERVATION })),
    ).toBe(false);
    expect(isMissingRecordCandidate(source({ changed_date: 1690876800000 }))).toBe(false);
    expect(isMissingRecordCandidate(source({ origin: "SEATool" }))).toBe(false);
    expect(isMissingRecordCandidate(source({ origin: "OneMACLegacy" }))).toBe(false);
  });

  it("keeps OneMAC records that only have camelCase changedDate", () => {
    expect(
      isMissingRecordCandidate(
        source({
          changedDate: "2023-08-01T12:00:00.000Z",
          changed_date: undefined,
        }),
      ),
    ).toBe(true);
  });

  it("excludes records that are not yet day 4", () => {
    expect(
      toMissingRecordCandidate(source(), new Date("2023-08-04T12:00:00-04:00")),
    ).toBeUndefined();
  });

  it("groups Medicaid SPA, CHIP, and waiver authorities", () => {
    const candidates: MissingRecordCandidate[] = [
      {
        id: "MD-23-0001",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 4,
      },
      {
        id: "MD-23-0002",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.CHIP_SPA,
        daysSinceSubmit: 4,
      },
      {
        id: "MD-23-0003",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority["1915b"],
        daysSinceSubmit: 5,
      },
      {
        id: "MD-23-0004",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority["1915c"],
        daysSinceSubmit: 6,
      },
    ];

    expect(groupCandidatesByMailbox(candidates)).toEqual({
      "medicaid-spa": [candidates[0]],
      "chip-spa": [candidates[1]],
      waiver: [candidates[2], candidates[3]],
    });
  });
});
