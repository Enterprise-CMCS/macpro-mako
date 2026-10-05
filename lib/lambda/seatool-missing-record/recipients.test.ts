import { Authority, EmailAddresses } from "shared-types";
import { describe, expect, it } from "vitest";

import {
  getEscalationRecipients,
  MailboxGroup,
  NON_PRODUCTION_TO_ADDRESSES,
  PRODUCTION_CC_ADDRESSES,
} from "./recipients";

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
};

const namedStaffEmails = [
  "ken.taylor@cms.hhs.gov",
  "angela.corbin@cms.hhs.gov",
  "maritza.bodon@cms.hhs.gov",
];

const groups: MailboxGroup[] = ["medicaid-spa", "chip-spa", "waiver"];

function flattenedAddresses(stage: string): string[] {
  return groups.flatMap((group) => {
    const recipients = getEscalationRecipients(stage, group, emails);
    return [...recipients.to, ...recipients.cc];
  });
}

describe("seatool missing-record recipients", () => {
  it.each(["main", "val", "oy2-40638", "manual"] as const)(
    "sends %s / non-production digests only to benjamin.paige@cms.hhs.gov",
    (stage) => {
      for (const group of groups) {
        expect(getEscalationRecipients(stage, group, emails)).toEqual({
          to: [...NON_PRODUCTION_TO_ADDRESSES],
          cc: [],
        });
      }

      const addresses = flattenedAddresses(stage);
      expect(addresses).toEqual([
        "benjamin.paige@cms.hhs.gov",
        "benjamin.paige@cms.hhs.gov",
        "benjamin.paige@cms.hhs.gov",
      ]);
      expect(addresses).not.toEqual(expect.arrayContaining(["osg@cms.hhs.gov"]));
      expect(addresses).not.toEqual(expect.arrayContaining(["chip.inbox@cms.hhs.gov"]));
      expect(addresses).not.toEqual(expect.arrayContaining([...PRODUCTION_CC_ADDRESSES]));
    },
  );

  it("uses osg/chip To lists and only the two production DLs on CC", () => {
    expect(getEscalationRecipients("production", "medicaid-spa", emails)).toEqual({
      to: ["osg@cms.hhs.gov"],
      cc: [...PRODUCTION_CC_ADDRESSES],
    });
    expect(getEscalationRecipients("production", "waiver", emails)).toEqual({
      to: ["osg@cms.hhs.gov"],
      cc: [...PRODUCTION_CC_ADDRESSES],
    });
    expect(getEscalationRecipients("production", "chip-spa", emails)).toEqual({
      to: ["chip.inbox@cms.hhs.gov"],
      cc: [...PRODUCTION_CC_ADDRESSES],
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
    expect(Authority.MED_SPA).toBe("medicaid spa");
  });
});
