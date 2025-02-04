import { describe, it, expect, vi, beforeEach } from "vitest";
import { transform } from "./capitated-amendment";
import { SEATOOL_STATUS } from "shared-types";
import * as dateHelper from "../../../../shared-utils/seatool-date-helper";

describe("capitated-amendment transform", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(dateHelper, "seaToolFriendlyTimestamp").mockImplementation((date?: string | Date) => {
      if (!date) return 0;
      const d = typeof date === "string" ? new Date(date) : date;
      const utcDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      return utcDate.getTime();
    });
  });

  const mockTimestamp = "2024-02-03T12:00:00.000Z";
  const mockDate = new Date(mockTimestamp);
  const mockMidnightUTC = new Date(
    Date.UTC(mockDate.getUTCFullYear(), mockDate.getUTCMonth(), mockDate.getUTCDate()),
  );

  const mockData = {
    id: "NY-12345.R01.02",
    event: "capitated-amendment" as const,
    additionalInformation: "Additional info",
    authority: "1915(b)",
    timestamp: new Date(mockTimestamp).getTime(),
    proposedEffectiveDate: new Date("2024-03-01").getTime(),
    submitterEmail: "test@example.com",
    submitterName: "Test User",
    actionType: "Amend",
    waiverNumber: "NY-12345.R01.01",
    attachments: {
      bCapWaiverApplication: {
        label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
        files: [
          {
            title: "Test Document",
            filename: "test.pdf",
            bucket: "test-bucket",
            key: "test-key",
            uploadDate: new Date(mockTimestamp).getTime(),
          },
        ],
      },
      bCapCostSpreadsheets: {
        label: "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
        files: [
          {
            title: "Test Spreadsheet",
            filename: "test.xlsx",
            bucket: "test-bucket",
            key: "test-key",
            uploadDate: new Date(mockTimestamp).getTime(),
          },
        ],
      },
      tribalConsultation: {
        label: "Tribal Consultation",
        files: [
          {
            title: "Test Consultation",
            filename: "consultation.pdf",
            bucket: "test-bucket",
            key: "test-key",
            uploadDate: new Date(mockTimestamp).getTime(),
          },
        ],
      },
      other: {
        label: "Other Documents",
        files: [
          {
            title: "Other Document",
            filename: "other.pdf",
            bucket: "test-bucket",
            key: "other-key",
            uploadDate: new Date(mockTimestamp).getTime(),
          },
        ],
      },
    },
  };

  it("should transform capitated-amendment data correctly", () => {
    const schema = transform();
    const result = schema.parse(mockData);

    expect(result).toEqual({
      additionalInformation: mockData.additionalInformation,
      authority: mockData.authority,
      changedDate: mockTimestamp,
      cmsStatus: "Submitted - Intake Needed",
      description: null,
      id: mockData.id,
      makoChangedDate: mockTimestamp,
      origin: "OneMAC",
      raiWithdrawEnabled: false,
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      state: "NY",
      stateStatus: "Submitted",
      statusDate: mockMidnightUTC.toISOString(),
      proposedEffectiveDate: new Date(mockData.proposedEffectiveDate).toISOString(),
      subject: null,
      submissionDate: mockTimestamp,
      submitterEmail: mockData.submitterEmail,
      submitterName: mockData.submitterName,
      actionType: mockData.actionType,
      initialIntakeNeeded: true,
    });

    expect(dateHelper.seaToolFriendlyTimestamp).toHaveBeenCalledWith(mockDate);
  });

  it("should handle missing optional fields", () => {
    const schema = transform();
    const minimalData = {
      id: "NY-12345.R01.02",
      event: "capitated-amendment" as const,
      timestamp: new Date(mockTimestamp).getTime(),
      authority: "1915(b)",
      submitterEmail: "test@example.com",
      submitterName: "Test User",
      actionType: "Amend",
      proposedEffectiveDate: new Date("2024-03-01").getTime(),
      waiverNumber: "NY-12345.R01.01",
      attachments: {
        bCapWaiverApplication: {
          label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
          files: [
            {
              title: "Test Document",
              filename: "test.pdf",
              bucket: "test-bucket",
              key: "test-key",
              uploadDate: new Date(mockTimestamp).getTime(),
            },
          ],
        },
        bCapCostSpreadsheets: {
          label: "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
          files: [
            {
              title: "Test Spreadsheet",
              filename: "test.xlsx",
              bucket: "test-bucket",
              key: "test-key",
              uploadDate: new Date(mockTimestamp).getTime(),
            },
          ],
        },
        tribalConsultation: {
          label: "Tribal Consultation",
          files: [
            {
              title: "Test Consultation",
              filename: "consultation.pdf",
              bucket: "test-bucket",
              key: "test-key",
              uploadDate: new Date(mockTimestamp).getTime(),
            },
          ],
        },
        other: {
          label: "Other Documents",
          files: [
            {
              title: "Other Document",
              filename: "other.pdf",
              bucket: "test-bucket",
              key: "other-key",
              uploadDate: new Date(mockTimestamp).getTime(),
            },
          ],
        },
      },
    };

    const result = schema.parse(minimalData);

    expect(result).toEqual({
      additionalInformation: undefined,
      authority: minimalData.authority,
      changedDate: mockTimestamp,
      cmsStatus: "Submitted - Intake Needed",
      description: null,
      id: minimalData.id,
      makoChangedDate: mockTimestamp,
      origin: "OneMAC",
      raiWithdrawEnabled: false,
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      state: "NY",
      stateStatus: "Submitted",
      statusDate: mockMidnightUTC.toISOString(),
      proposedEffectiveDate: new Date(minimalData.proposedEffectiveDate).toISOString(),
      subject: null,
      submissionDate: mockTimestamp,
      submitterEmail: minimalData.submitterEmail,
      submitterName: minimalData.submitterName,
      actionType: minimalData.actionType,
      initialIntakeNeeded: true,
    });
  });

  it("should extract state from ID correctly", () => {
    const schema = transform();
    const dataWithDifferentState = {
      ...mockData,
      id: "CA-12345.R01.02",
    };

    const result = schema.parse(dataWithDifferentState);
    expect(result.state).toBe("CA");
  });

  it("should set correct status values", () => {
    const schema = transform();
    const result = schema.parse(mockData);

    expect(result.seatoolStatus).toBe(SEATOOL_STATUS.SUBMITTED);
    expect(result.stateStatus).toBe("Submitted");
    expect(result.cmsStatus).toBe("Submitted - Intake Needed");
    expect(result.raiWithdrawEnabled).toBe(false);
    expect(result.initialIntakeNeeded).toBe(true);
  });

  it("should format all dates as ISO strings", () => {
    const schema = transform();
    const result = schema.parse(mockData);

    const isISOString = (date: string) => {
      const d = new Date(date);
      return d.toISOString() === date;
    };

    expect(isISOString(result.changedDate)).toBe(true);
    expect(isISOString(result.makoChangedDate)).toBe(true);
    expect(isISOString(result.statusDate)).toBe(true);
    expect(isISOString(result.submissionDate)).toBe(true);
  });
});
