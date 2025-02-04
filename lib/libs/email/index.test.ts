import { describe, expect, it, vi } from "vitest";
import {
  AuthoritiesWithUserTypesTemplate,
  getEmailTemplate,
  getEmailTemplates,
  getLatestMatchingEvent,
} from "./index";
import * as EmailContent from "./content";
import * as packageApi from "../api/package";
import { Authority, Action } from "shared-types";
import { Response } from "shared-types/opensearch/changelog";
import { Hit } from "shared-types/opensearch/_";
import { Document } from "shared-types/opensearch/changelog";

vi.mock("../api/package", () => ({
  getPackageChangelog: vi.fn(),
}));

vi.mock("./content", () => {
  const stateFn = vi.fn();
  const cmsFn = vi.fn();
  return {
    newSubmission: {
      medicaid: {
        state: stateFn,
        cms: cmsFn,
      },
    },
    tempExtension: vi.fn(),
    withdrawPackage: vi.fn(),
    withdrawRai: vi.fn(),
    respondToRai: vi.fn(),
    uploadSubsequentDocuments: vi.fn(),
  };
});

describe("email", () => {
  describe("getEmailTemplate", () => {
    it("should return template for basic action", () => {
      const template = getEmailTemplate("new-medicaid-submission");
      expect(template).toBe(EmailContent.newSubmission);
    });

    it("should handle -state suffix variants", () => {
      const template = getEmailTemplate("contracting-amendment-state");
      expect(template).toBe(EmailContent.newSubmission);
    });
  });

  describe("getEmailTemplates", () => {
    const mockFile = {
      key: "test-key",
      title: "Test File",
      filename: "test.pdf",
      bucket: "test-bucket",
      uploadDate: Date.now(),
    };

    const mockAttachments = {
      cmsForm179: { label: "CMS Form 179", files: [mockFile] },
      spaPages: { label: "SPA Pages", files: [mockFile] },
      coverLetter: { label: "Cover Letter", files: [mockFile] },
      tribalEngagement: { label: "Tribal Engagement", files: [mockFile] },
      existingStatePlanPages: { label: "Existing State Plan Pages", files: [mockFile] },
      publicNotice: { label: "Public Notice", files: [mockFile] },
      sfq: { label: "SFQ", files: [mockFile] },
      tribalConsultation: { label: "Tribal Consultation", files: [mockFile] },
      other: { label: "Other", files: [mockFile] },
    };

    const mockEvent = {
      id: "test-id",
      packageId: "test-package",
      event: "new-medicaid-submission" as const,
      authority: "medicaid" as Authority,
      origin: "mako" as const,
      submitterName: "Test User",
      submitterEmail: "test@example.com",
      proposedEffectiveDate: Date.now(),
      title: "Test Package",
      attachments: mockAttachments,
      actionType: Action.UPLOAD_SUBSEQUENT_DOCUMENTS,
      timestamp: Date.now(),
      waiverNumber: "WA-12345",
      additionalInformation: "",
      changeType: null,
      changeMade: "Initial submission",
      changeReason: "New package",
      isAdminChange: false,
      raiWithdrawEnabled: false,
    };

    it("should return empty array for unknown event", async () => {
      const templates = await getEmailTemplates({
        ...mockEvent,
        event: "unknown-event" as any,
      });
      expect(templates).toEqual([]);
    });

    it("should return authority-specific templates when authority present", async () => {
      const templates = await getEmailTemplates(mockEvent);
      const mockEmailContent = EmailContent as unknown as {
        newSubmission: AuthoritiesWithUserTypesTemplate;
      };
      expect(templates).toEqual([
        mockEmailContent.newSubmission[Authority.MED_SPA]?.state,
        mockEmailContent.newSubmission[Authority.MED_SPA]?.cms,
      ]);
    });
  });

  describe("getLatestMatchingEvent", () => {
    const mockId = "test-id";
    const mockActionType = "new-medicaid-submission";

    const mockFile = {
      key: "test-key",
      title: "Test File",
      filename: "test.pdf",
      bucket: "test-bucket",
      uploadDate: Date.now(),
    };

    const createMockEvent = (timestamp: number): Hit<Document> => ({
      _index: "test-index",
      _id: "test-id",
      _score: 1,
      sort: [timestamp],
      _source: {
        id: "test-id",
        packageId: "test-package",
        event: mockActionType,
        authority: "medicaid",
        origin: "mako" as const,
        submitterName: "Test User",
        submitterEmail: "test@example.com",
        proposedEffectiveDate: Date.now(),
        title: "Test Package",
        attachments: [mockFile],
        actionType: Action.UPLOAD_SUBSEQUENT_DOCUMENTS,
        timestamp,
        additionalInformation: "",
        waiverNumber: "WA-12345",
        changeType: null,
        changeMade: "Initial submission",
        changeReason: "New package",
        isAdminChange: false,
        raiWithdrawEnabled: false,
      },
    });

    it("should return null when no changelog found", async () => {
      const response = {
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          hits: [],
          total: { value: 0, relation: "eq" },
          max_score: 0,
        },
        total: { value: 0, relation: "eq" },
        max_score: 0,
        took: 1,
        timed_out: false,
      } as Response;

      vi.mocked(packageApi.getPackageChangelog).mockResolvedValue(response);

      const result = await getLatestMatchingEvent(mockId, mockActionType);
      expect(result).toBeNull();
    });

    it("should return null when no matching events found", async () => {
      const mockEvent = createMockEvent(123);
      mockEvent._source.event = "new-chip-submission";

      const response = {
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          hits: [mockEvent],
          total: { value: 1, relation: "eq" },
          max_score: 1,
        },
        total: { value: 1, relation: "eq" },
        max_score: 1,
        took: 1,
        timed_out: false,
      } as Response;

      vi.mocked(packageApi.getPackageChangelog).mockResolvedValue(response);

      const result = await getLatestMatchingEvent(mockId, mockActionType);
      expect(result).toBeNull();
    });

    it("should return latest matching event", async () => {
      const mockEvent1 = createMockEvent(100);
      const mockEvent2 = createMockEvent(200);

      const response = {
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          hits: [mockEvent1, mockEvent2],
          total: { value: 2, relation: "eq" },
          max_score: 1,
        },
        total: { value: 2, relation: "eq" },
        max_score: 1,
        took: 1,
        timed_out: false,
      } as Response;

      vi.mocked(packageApi.getPackageChangelog).mockResolvedValue(response);

      const result = await getLatestMatchingEvent(mockId, mockActionType);
      expect(result).toEqual(mockEvent2._source);
    });

    it("should handle error and return null", async () => {
      vi.mocked(packageApi.getPackageChangelog).mockRejectedValue(new Error("Test error"));
      const consoleSpy = vi.spyOn(console, "error");

      const result = await getLatestMatchingEvent(mockId, mockActionType);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("Error getting latest matching event:", {
        id: mockId,
        error: new Error("Test error"),
      });
    });
  });
});
