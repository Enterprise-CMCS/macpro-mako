import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { MedSpaCMSEmail } from "./MedSpaCMS";
import { MedSpaStateEmail } from "./MedSpaState";
import { ChipSpaCMSEmail } from "./ChipSpaCMS";
import { ChipSpaStateEmail } from "./ChipSpaState";
import { Waiver1915bCMSEmail } from "./Waiver1915bCMS";
import { Waiver1915bStateEmail } from "./Waiver1915bState";
import { RaiResponse } from "shared-types";
import { CommonVariables } from "../../..";

const mockVariables: RaiResponse & CommonVariables = {
  territory: "California",
  submitterName: "John Doe",
  submitterEmail: "john.doe@example.com",
  id: "CO-24-TEST", // Changed from string to number
  responseDate: Date.now(),
  additionalInformation: "Some additional info",
  applicationEndpointUrl: "http://example.com",
  attachments: [
    {
      filename: "file.pdf",
      title: "File Title",
      bucket: "bucket-name",
      key: "file-key",
      uploadDate: Date.now(),
    },
  ],
  authority: "CHIP-SPA",
  origin: "micro",
  requestedDate: Date.now(),
  to: "recipient@example.com",
  actionType: "Some Action",
  allStateUsersEmails: ["user1@example.com", "user2@example.com"],
};

describe("Email Templates", () => {
  it("renders MedSpaCMSEmail correctly", async () => {
    const comp = await render(<MedSpaCMSEmail variables={mockVariables} />);
    expect(comp).toMatch(
      /The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:/,
    );
  });

  it("renders MedSpaStateEmail correctly", async () => {
    const comp = await render(<MedSpaStateEmail variables={mockVariables} />);
    expect(comp).toMatch(
      /This response confirms you submitted a Medicaid SPA RAI Response to CMS for review:/,
    );
  });

  it("renders ChipSpaCMSEmail correctly", async () => {
    const comp = await render(<ChipSpaCMSEmail variables={mockVariables} />);
    expect(comp).toMatch(
      /The OneMAC Submission Portal received a CHIP SPA RAI Response Submission:/,
    );
  });

  it("renders ChipSpaStateEmail correctly", async () => {
    const comp = await render(<ChipSpaStateEmail variables={mockVariables} />);
    expect(comp).toMatch(
      /This response confirms you submitted a CHIP SPA RAI Response to CMS for review:/,
    );
  });

  it("renders Waiver1915bCMSEmail correctly", async () => {
    const comp = await render(
      <Waiver1915bCMSEmail variables={mockVariables} />,
    );
    expect(comp).toMatch(
      /The OneMAC Submission Portal received a .* Waiver RAI Response Submission:/,
    );
  });

  it("renders Waiver1915bStateEmail correctly", async () => {
    const comp = await render(
      <Waiver1915bStateEmail variables={mockVariables} />,
    );
    expect(comp).toContain("Waiver RAI Response to CMS for review");
  });
});
