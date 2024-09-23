import * as React from "react";
import { render } from "@testing-library/react";
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
  it("renders MedSpaCMSEmail correctly", () => {
    const { getByText } = render(<MedSpaCMSEmail variables={mockVariables} />);
    expect(
      getByText(
        /The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders MedSpaStateEmail correctly", () => {
    const { getByText } = render(
      <MedSpaStateEmail variables={mockVariables} />,
    );
    expect(
      getByText(
        /This response confirms you submitted a Medicaid SPA RAI Response to CMS for review:/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders ChipSpaCMSEmail correctly", () => {
    const { getByText } = render(<ChipSpaCMSEmail variables={mockVariables} />);
    expect(
      getByText(
        /The OneMAC Submission Portal received a CHIP SPA RAI Response Submission:/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders ChipSpaStateEmail correctly", () => {
    const { getByText } = render(
      <ChipSpaStateEmail variables={mockVariables} />,
    );
    expect(
      getByText(
        /This response confirms you submitted a CHIP SPA RAI Response to CMS for review:/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders Waiver1915bCMSEmail correctly", () => {
    const { getByText } = render(
      <Waiver1915bCMSEmail variables={mockVariables} />,
    );
    expect(
      getByText(
        /The OneMAC Submission Portal received a .* Waiver RAI Response Submission:/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders Waiver1915bStateEmail correctly", () => {
    const { getByText } = render(
      <Waiver1915bStateEmail variables={mockVariables} />,
    );
    expect(
      getByText(
        /This response confirms the submission of your .* Waiver RAI Response to CMS for review:/i,
      ),
    ).toBeInTheDocument();
  });
});
