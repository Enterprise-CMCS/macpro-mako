import { describe, expect, it, vi } from "vitest";

import {
  renderSeatoolMissingRecordEmail,
  SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL,
  SEATOOL_MISSING_RECORD_SUBJECT,
} from "./index";

describe("seatool missing-record email template", () => {
  it("renders the required subject and helpdesk footer", async () => {
    vi.useRealTimers();
    const email = await renderSeatoolMissingRecordEmail({
      to: ["benjamin.paige@cms.hhs.gov"],
      applicationEndpointUrl: "https://onemac.cms.gov/",
      packages: [
        {
          id: "MD-23-0001",
          submissionDate: "08/01/2023",
          authority: "medicaid spa",
          daysSinceSubmit: 4,
        },
      ],
    });

    expect(email.subject).toBe(SEATOOL_MISSING_RECORD_SUBJECT);
    expect(email.subject).toBe("ACTION REQUIRED - No matching record in SEA Tool");
    expect(email.body).toContain(SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL);
    expect(email.body).toContain("OneMAC_HelpDesk@cms.hhs.gov");
    expect(email.body).toContain("no matching SEA Tool record");
    expect(email.body).not.toContain("day 4");
    expect(email.body).not.toContain("day 6");
    expect(email.body).not.toContain("day 8");
  });
});
