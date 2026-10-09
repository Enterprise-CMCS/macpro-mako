import { describe, expect, it } from "vitest";

import {
  renderSeatoolMissingRecordEmail,
  SEA_TOOL_URL,
  SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL,
  SEATOOL_MISSING_RECORD_SUBJECT,
} from "./index";

const packageRow = {
  id: "MD-23-0001",
  submissionDate: "08/01/2023",
  authority: "medicaid spa",
  daysSinceSubmit: 4,
};

describe("seatool missing-record email template", () => {
  it("renders one package with the ticket subject, OneMAC wording, and helpdesk footer", async () => {
    const email = await renderSeatoolMissingRecordEmail({
      to: ["benjamin.paige@cms.hhs.gov"],
      applicationEndpointUrl: "https://onemac.cms.gov/",
      packages: [packageRow],
    });

    expect(email.subject).toBe(`MD-23-0001 - ${SEATOOL_MISSING_RECORD_SUBJECT}`);
    expect(email.subject).toBe("MD-23-0001 - ACTION REQUIRED - No matching record in SEA Tool");
    expect(email.body).toContain(SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL);
    expect(email.body).toContain("mailto:OneMAC_HelpDesk@cms.hhs.gov");
    expect(email.body).toContain("This is a reminder that there is no matching record in");
    expect(email.body).toContain("MD-23-0001");
    expect(email.body).toContain("OneMAC");
    expect(email.body).toContain("https://onemac.cms.gov/");
    expect(email.body).toContain(SEA_TOOL_URL);
    expect(email.body).toContain(
      "Either a record was not created in SEA Tool or the SPA/Waiver ID in",
    );
    expect(email.body).toContain("Medicaid SPA");
    expect(email.body).toContain("Submitted: 08/01/2023");
    expect(email.body).toContain("4 days have passed since submission.");
    expect(email.body).toContain('bgcolor="#165296"');
    expect(email.body).not.toContain("Appian");
    expect(email.body.toLowerCase()).not.toContain("urgent");
    expect(email.body.toLowerCase()).not.toContain("deemed");
    expect(email.body).not.toContain("day 4");
    expect(email.body).not.toContain("day 6");
    expect(email.body).not.toContain("day 8");
    expect(email.text).toContain("OneMAC_HelpDesk@cms.hhs.gov");
    expect(email.text).toContain("MD-23-0001");
    expect(email.text).not.toContain("Appian");
  });

  it("renders a grouped digest without a single package id in the subject", async () => {
    const email = await renderSeatoolMissingRecordEmail({
      to: ["missing-record-dev@example.com"],
      applicationEndpointUrl: "https://example.cloudfront.net/",
      packages: [
        packageRow,
        {
          id: "VA-23-0002",
          submissionDate: "07/30/2023",
          authority: "1915(c)",
          daysSinceSubmit: 6,
        },
      ],
    });

    expect(email.subject).toBe(SEATOOL_MISSING_RECORD_SUBJECT);
    expect(email.body).toContain("the following packages");
    expect(email.body).toContain("MD-23-0001");
    expect(email.body).toContain("VA-23-0002");
    expect(email.body).toContain("1915(c)");
    expect(email.body).toContain("6");
    expect(email.text).toContain("VA-23-0002");
  });
});
