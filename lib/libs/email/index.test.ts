import {
  ATTACHMENT_BUCKET_NAME,
  CAPITATED_AMEND_ITEM_ID,
  errorOSChangelogSearchHandler,
  EXISTING_ITEM_ID,
  TEST_ITEM_ID,
  WITHDRAW_EMAIL_SENT,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import type { Events } from "shared-types";
import { describe, expect, it } from "vitest";

import * as EmailContent from "./content";
import { getEmailTemplate, getEmailTemplates, getLatestMatchingEvent } from "./index";

describe("Email utils", () => {
  describe("getEmailTemplate", () => {
    it("should handle an undefined action", () => {
      // @ts-ignore
      expect(getEmailTemplate()).toEqual(undefined);
    });

    it("should handle a null action", () => {
      // @ts-ignore
      expect(getEmailTemplate(null)).toEqual(undefined);
    });

    it("should handle an empty string action", () => {
      // @ts-ignore
      expect(getEmailTemplate("")).toEqual(undefined);
    });

    it("should handle an invalid action", () => {
      // @ts-ignore
      expect(getEmailTemplate("invalid")).toEqual(undefined);
    });

    it("should handle an action without -state", () => {
      expect(getEmailTemplate("new-medicaid-submission")).toEqual(EmailContent.newSubmission);
    });

    it("should handle an action with -state", () => {
      expect(getEmailTemplate("contracting-amendment-state")).toEqual(EmailContent.newSubmission);
    });
  });

  describe("getEmailTemplates", () => {
    it("should handle an undefined record", async () => {
      // @ts-ignore
      await expect(() => getEmailTemplates()).rejects.toThrowError("Invalid record");
    });

    it("should handle a null record", async () => {
      // @ts-ignore
      await expect(() => getEmailTemplates(null)).rejects.toThrowError("Invalid record");
    });

    it("should handle a record without an event", async () => {
      await expect(() =>
        // @ts-ignore
        getEmailTemplates({
          authority: "Medicaid SPA",
        }),
      ).rejects.toThrowError("Missing event authority or email template for event");
    });

    it("should handle a record if there is no email template for the authority", async () => {
      await expect(() =>
        // @ts-ignore
        getEmailTemplates({
          id: "SS-1235.R00.01-0001",
          event: "temporary-extension",
          packageId: "SS-1235.R00.01",
          timestamp: 1685624400000, // Jun 1, 2023, in milliseconds
          isAdminChange: true,
          authority: "Medicaid SPA",
          submitterEmail: "test@example.com",
          origin: "mako",
        } as Events["TemporaryExtension"]),
      ).rejects.toThrowError("No email template found for authority");
    });

    it("should handle a new-medicaid-submission", async () => {
      const [cms, state] = await getEmailTemplates({
        event: "new-medicaid-submission",
        additionalInformation: "testing",
        attachments: {
          cmsForm179: {
            files: [
              {
                filename: "cms179form.txt",
                title: "CMS 179",
                bucket: "test-bucket",
                key: "misc001",
                uploadDate: 1685491200000,
              },
            ],
            label: "CMS-179 Form",
          },
          spaPages: {
            files: [
              {
                filename: "spaPages.txt",
                title: "SPA Pates",
                bucket: "test-bucket",
                key: "misc002",
                uploadDate: 1685491200000,
              },
            ],
            label: "SPA Pages",
          },
          coverLetter: {
            files: [],
            label: "Cover Letter",
          },
          tribalEngagement: {
            files: [],
            label: "Documenting Demonstrating Good-Faith Tribal Engagement",
          },
          existingStatePlanPages: {
            files: [],
            label: "Existing State Plan Page(s)",
          },
          publicNotice: {
            files: [],
            label: "Public Notice",
          },
          sfq: {
            files: [],
            label: "Standard Funding Questions (SFQs)",
          },
          tribalConsultation: {
            files: [],
            label: "Tribal Consultation",
          },
          other: {
            files: [],
            label: "Other",
          },
        },
        authority: "Medicaid SPA",
        proposedEffectiveDate: 1685491200000,
        id: "SS-25-1234",
        packageId: "SS-1235.R00.01",
        timestamp: 1685624400000, // Jun 1, 2023, in milliseconds
        submitterName: "Test Submitter",
        submitterEmail: "test@example.com",
        origin: "mako",
      } as Events["NewMedicaidSubmission"]);
      expect(cms).toBeTypeOf("function");
      expect(state).toBeTypeOf("function");
    });
  });

  describe("getLatestMatchingEvent", () => {
    it("should handle a package with no change log", async () => {
      const result = await getLatestMatchingEvent(EXISTING_ITEM_ID, "new-medicaid-submission");
      expect(result).toBeNull();
    });

    it("should handle a package with a change log with no _source", async () => {
      const result = await getLatestMatchingEvent(WITHDRAW_EMAIL_SENT, "new-medicaid-submission");
      expect(result).toBeNull();
    });

    it("should handle a package with no matching action", async () => {
      const result = await getLatestMatchingEvent(TEST_ITEM_ID, "respond-to-rai");
      expect(result).toBeNull();
    });

    it("should handle error getting changelog", async () => {
      mockedServer.use(errorOSChangelogSearchHandler);
      const result = await getLatestMatchingEvent(
        CAPITATED_AMEND_ITEM_ID,
        "upload-subsequent-documents",
      );
      expect(result).toBeNull();
    });

    it("should return the latest event", async () => {
      const result = await getLatestMatchingEvent(
        CAPITATED_AMEND_ITEM_ID,
        "upload-subsequent-documents",
      );
      expect(result).toEqual({
        id: `${CAPITATED_AMEND_ITEM_ID}-0003`,
        event: "upload-subsequent-documents",
        packageId: CAPITATED_AMEND_ITEM_ID,
        authority: "Medicaid SPA",
        attachments: [
          {
            key: "subdoc003",
            title: "Follow-Up Documents",
            filename: "followup_docs.zip",
            bucket: ATTACHMENT_BUCKET_NAME,
          },
        ],
        additionalInformation: "Supporting documents uploaded as follow-up.",
        timestamp: 1678715205000, // Mar 13, 2023
      });
    });
  });
});
