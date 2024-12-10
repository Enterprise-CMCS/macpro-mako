import { describe, it, expect, vi, beforeEach } from "vitest";
import { newMedicaidSubmission } from "./new-medicaid-submission";
import { isAuthorized, getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";

import { type APIGatewayEvent } from "aws-lambda";

// Mock AppK Payload
const mockAppKPayload = {
  id: "SS-11-2020",
  event: "new-medicaid-submission",
  authority: "1915(b)",
  proposedEffectiveDate: 1700000000,
  title: "Sample Title for Appendix K",
  attachments: {
    cmsForm179: {
      label: "CMS Form 179",
      files: [
        {
          filename: "appendix-k-amendment.docx",
          title: "Appendix K Waiver Amendment",
          bucket: "mako-outbox-attachments-635052997545",
          key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
          uploadDate: Date.now(),
        },
      ],
    },
    spaPages: {
        label: "Spa Pages",
        files: [
          {
            filename: "appendix-k-amendment.docx",
            title: "Appendix K Waiver Amendment",
            bucket: "mako-outbox-attachments-635052997545",
            key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
            uploadDate: Date.now(),
          },
        ],
      },
      coverLetter: {
        label: "Cover Letter",
        files: [
          {
            filename: "appendix-k-amendment.docx",
            title: "Appendix K Waiver Amendment",
            bucket: "mako-outbox-attachments-635052997545",
            key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
            uploadDate: Date.now(),
          },
        ],
      },   
      tribalEngagement: {
        label: "Document Demonstrating Good-Faith Tribal Engagement",
        files: [
          {
            filename: "appendix-k-amendment.docx",
            title: "Appendix K Waiver Amendment",
            bucket: "mako-outbox-attachments-635052997545",
            key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
            uploadDate: Date.now(),
          },
        ],
      },   
      existingStatePlanPages: {
        label: "Existing State Plan Page(s)",
        files: [
          {
            filename: "appendix-k-amendment.docx",
            title: "Appendix K Waiver Amendment",
            bucket: "mako-outbox-attachments-635052997545",
            key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
            uploadDate: Date.now(),
          },
        ],
      },
      publicNotice: {
        label: "Public Notice",
        files: [
          {
            filename: "appendix-k-amendment.docx",
            title: "Appendix K Waiver Amendment",
            bucket: "mako-outbox-attachments-635052997545",
            key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
            uploadDate: Date.now(),
          },
        ],
      },
      sfq: {
        label: "Standard Funding Questions (SFQs)",
        files: [
          {
            filename: "appendix-k-amendment.docx",
            title: "Appendix K Waiver Amendment",
            bucket: "mako-outbox-attachments-635052997545",
            key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
            uploadDate: Date.now(),
          },
        ],
      },  
      tribalConsultation: {
        label: "Tribal Consultation",
        files: [
          {
            filename: "appendix-k-amendment.docx",
            title: "Appendix K Waiver Amendment",
            bucket: "mako-outbox-attachments-635052997545",
            key: "8b56f7ab-e1ad-4782-87f4-d43ab9d2f5d7.docx",
            uploadDate: Date.now(),
          },
        ],
      },          
    other: {
        files: [
            {
              filename: "misc-documents.pdf",
              title: "Additional Supporting Documents",
              bucket: "mako-outbox-attachments-635052997545",
              key: "c22aa4dc-e1b6-41d5-bf64-e45b6f74f5af.pdf",
              uploadDate: Date.now(),
            },
          ],
          label: "Other",
    },
  },
  additionalInformation: "Some additional information about this submission.",
  waiverNumber:'SS-1111.R11.11'

};

vi.mock("libs/api/auth/user", () => ({
  isAuthorized: vi.fn(),
  getAuthDetails: vi.fn(),
  lookupUserAttributes: vi.fn(),
}));

vi.mock("libs/api/package", () => ({
  itemExists: vi.fn(),
}));

describe("appK function", () => {
  const mockIsAuthorized = vi.mocked(isAuthorized);
  const mockGetAuthDetails = vi.mocked(getAuthDetails);
  const mockLookupUserAttributes = vi.mocked(lookupUserAttributes);


  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should be unauthorized", async () => {
    mockIsAuthorized.mockResolvedValueOnce(false);

    mockLookupUserAttributes.mockResolvedValueOnce({
        email: "john.doe@example.com",
        given_name: "John",
        family_name: "Doe",
        sub: "",
        "custom:cms-roles": "",
        email_verified: false,
        username: ""
    });


    // Mock API Gateway Event
    const mockEvent = {
        body: JSON.stringify(mockAppKPayload),
    } as APIGatewayEvent;

    await expect(newMedicaidSubmission(mockEvent)).rejects.toThrow("Unauthorized");

  });
  it("should have no body on submission and throw an error", async () => {
    mockIsAuthorized.mockResolvedValueOnce(true);

    mockLookupUserAttributes.mockResolvedValueOnce({
        email: "john.doe@example.com",
        given_name: "John",
        family_name: "Doe",
        sub: "",
        "custom:cms-roles": "",
        email_verified: false,
        username: ""
    });

    const mockEvent = {
        fail: 'fail',
    } as unknown as APIGatewayEvent;


    const result = await newMedicaidSubmission(mockEvent);

    expect(result?.submitterName).toBeUndefined();

  });

  it("should process valisd input and return transformed data", async () => {
    mockIsAuthorized.mockResolvedValueOnce(true);
    mockGetAuthDetails.mockReturnValueOnce({ userId: "user-123", poolId: "pool-123" });
    mockLookupUserAttributes.mockResolvedValueOnce({
        email: "john.doe@example.com",
        given_name: "John",
        family_name: "Doe",
        sub: "",
        "custom:cms-roles": "",
        email_verified: false,
        username: ""
    });


    const mockEvent = {
      body: JSON.stringify(mockAppKPayload),
    } as APIGatewayEvent;

    const result = await newMedicaidSubmission(mockEvent);

    expect(result?.submitterName).toEqual('John Doe');

  });
});
