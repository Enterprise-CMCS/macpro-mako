import { EmailAddresses } from "shared-types";
import { describe, expect, it } from "vitest";

import { getEscalationRecipients, MailboxGroup } from "./recipients";

const emails: EmailAddresses = {
  osgEmail: ["osg@cms.hhs.gov"],
  dpoEmail: ["dpo-internal@cms.hhs.gov"],
  dmcoEmail: [],
  dhcbsooEmail: [],
  chipInbox: ["chip.inbox@cms.hhs.gov"],
  chipCcList: [],
  sourceEmail: "source@example.com",
  srtEmails: [],
  cpocEmail: [],
  accessEmail: "access@example.com",
  seatoolMissingRecordTo: ["missing-record-dev@example.com"],
  seatoolHelpdesk: ["seatool-helpdesk@example.com"],
  dpoApprover: ["dpo-approver@example.com"],
};

const namedStaffEmails = [
  "ken.taylor@cms.hhs.gov",
  "angela.corbin@cms.hhs.gov",
  "maritza.bodon@cms.hhs.gov",
];

const groups: MailboxGroup[] = ["medicaid-spa", "chip-spa", "waiver"];

function flattenedAddresses(stage: string, secret: EmailAddresses = emails): string[] {
  return groups.flatMap((group) => {
    const recipients = getEscalationRecipients(stage, group, secret);
    return [...recipients.to, ...recipients.cc];
  });
}

describe("seatool missing-record recipients", () => {
  it.each(["main", "val", "oy2-40638", "manual"] as const)(
    "sends %s / non-production digests only to seatoolMissingRecordTo",
    (stage) => {
      for (const group of groups) {
        expect(getEscalationRecipients(stage, group, emails)).toEqual({
          to: ["missing-record-dev@example.com"],
          cc: [],
        });
      }

      const addresses = flattenedAddresses(stage);
      expect(addresses).toEqual([
        "missing-record-dev@example.com",
        "missing-record-dev@example.com",
        "missing-record-dev@example.com",
      ]);
      expect(addresses).not.toEqual(expect.arrayContaining(["osg@cms.hhs.gov"]));
      expect(addresses).not.toEqual(expect.arrayContaining(["chip.inbox@cms.hhs.gov"]));
      expect(addresses).not.toEqual(
        expect.arrayContaining(["seatool-helpdesk@example.com", "dpo-approver@example.com"]),
      );
    },
  );

  it("uses osg/chip To lists and secret helpdesk/DPO CCs in production", () => {
    expect(getEscalationRecipients("production", "medicaid-spa", emails)).toEqual({
      to: ["osg@cms.hhs.gov"],
      cc: ["seatool-helpdesk@example.com", "dpo-approver@example.com"],
    });
    expect(getEscalationRecipients("production", "waiver", emails)).toEqual({
      to: ["osg@cms.hhs.gov"],
      cc: ["seatool-helpdesk@example.com", "dpo-approver@example.com"],
    });
    expect(getEscalationRecipients("production", "chip-spa", emails)).toEqual({
      to: ["chip.inbox@cms.hhs.gov"],
      cc: ["seatool-helpdesk@example.com", "dpo-approver@example.com"],
    });
    expect(flattenedAddresses("production")).not.toEqual(
      expect.arrayContaining(["dpo-internal@cms.hhs.gov"]),
    );
  });

  it("returns empty lists when the secret keys are missing", () => {
    const withoutEscalationFields: EmailAddresses = {
      ...emails,
      seatoolMissingRecordTo: undefined,
      seatoolHelpdesk: undefined,
      dpoApprover: undefined,
    };

    expect(getEscalationRecipients("main", "medicaid-spa", withoutEscalationFields)).toEqual({
      to: [],
      cc: [],
    });
    expect(getEscalationRecipients("production", "waiver", withoutEscalationFields)).toEqual({
      to: ["osg@cms.hhs.gov"],
      cc: [],
    });
  });

  it("does not hardcode named CMS staff emails", () => {
    const addresses = flattenedAddresses("production").join(" ").toLowerCase();

    for (const namedEmail of namedStaffEmails) {
      expect(addresses).not.toContain(namedEmail);
    }

    expect(addresses).not.toContain("ken taylor");
    expect(addresses).not.toContain("angela corbin");
    expect(addresses).not.toContain("maritza bodon");
  });
});
