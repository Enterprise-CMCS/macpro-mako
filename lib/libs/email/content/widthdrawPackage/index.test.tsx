import * as React from "react";
import { withdrawPackage } from "./index";
import { Authority, EmailAddresses, WithdrawPackage } from "shared-types";
import { CommonVariables } from "../..";
import { render } from "@react-email/render";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  Waiver1915bCMSEmail,
  Waiver1915bStateEmail,
} from "./emailTemplates";
import { vi } from "vitest";
vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<html></html>"),
}));

vi.mock("./emailTemplates", () => ({
  MedSpaCMSEmail: vi.fn(),
  MedSpaStateEmail: vi.fn(),
  ChipSpaCMSEmail: vi.fn(),
  Waiver1915bCMSEmail: vi.fn(),
  Waiver1915bStateEmail: vi.fn(),
  ChipSpaStateEmail: vi.fn(),
}));

const mockVariables: WithdrawPackage &
  CommonVariables & { emails: EmailAddresses } = {
  id: "12345",
  submitterName: "John Doe",
  submitterEmail: "john.doe@example.com",
  authority: "Some Authority",
  territory: "Some Territory",
  origin: "Some Origin",
  additionalInformation: "Some additional information",
  emails: {
    osgEmail: ["osg@example.com"],
    dpoEmail: ["dpo@example.com"],
    dmcoEmail: ["dmco@example.com"],
    dhcbsooEmail: ["dhcbsoo@example.com"],
    chipInbox: ["chipinbox@example.com"],
    srtEmails: ["srt@example.com"],
    cpocEmail: ["cpoc@example.com"],
    chipCcList: ["cc@example.com"],
    sourceEmail: "source@example.com",
  },
  applicationEndpointUrl: "http://example.com",
  attachments: [],
  to: "recipient@example.com",
  actionType: "Some Action",
  allStateUsersEmails: ["stateuser@example.com"],
};

describe("withdrawPackage", () => {
  describe("MED_SPA", () => {
    it("should generate CMS email correctly", async () => {
      const result = await withdrawPackage[Authority.MED_SPA]?.cms?.(
        mockVariables,
      );
      expect(result?.to).toEqual(mockVariables.emails.osgEmail);
      expect(result?.cc).toEqual(mockVariables.emails.dpoEmail);
      expect(result?.subject).toBe(
        `SPA Package ${mockVariables.id} Withdraw Request`,
      );
      expect(render).toHaveBeenCalledWith(
        <MedSpaCMSEmail variables={mockVariables} />,
      );
    });

    it("should generate State email correctly", async () => {
      const result = await withdrawPackage[Authority.MED_SPA]?.state?.(
        mockVariables,
      );
      expect(result?.to).toEqual([
        `"${mockVariables.submitterName}" <${mockVariables.submitterEmail}>`,
      ]);
      expect(result?.subject).toBe(
        `Medicaid SPA Package ${mockVariables.id} Withdrawal Confirmation`,
      );
      expect(render).toHaveBeenCalledWith(
        <MedSpaStateEmail variables={mockVariables} />,
      );
    });
  });

  describe("CHIP_SPA", () => {
    it("should generate CMS email correctly", async () => {
      const result = await withdrawPackage[Authority.CHIP_SPA]?.cms?.(
        mockVariables,
      );
      expect(result?.to).toEqual([
        ...mockVariables.emails.cpocEmail,
        ...mockVariables.emails.srtEmails,
      ]);
      expect(result?.cc).toEqual(mockVariables.emails.chipCcList);
      expect(result?.subject).toBe(
        `CHIP SPA Package ${mockVariables.id} Withdraw Request`,
      );
      expect(render).toHaveBeenCalledWith(
        <ChipSpaCMSEmail variables={mockVariables} />,
      );
    });

    // State email for CHIP_SPA is commented out in the source code
  });

  describe("1915b", () => {
    it("should generate CMS email correctly", async () => {
      const result = await withdrawPackage[Authority["1915b"]]?.cms?.(
        mockVariables,
      );
      expect(result?.to).toEqual(mockVariables.emails.osgEmail);
      expect(result?.subject).toBe(
        `Waiver Package ${mockVariables.id} Withdraw Request`,
      );
      expect(render).toHaveBeenCalledWith(
        <Waiver1915bCMSEmail variables={mockVariables} />,
      );
    });

    it("should generate State email correctly", async () => {
      const result = await withdrawPackage[Authority["1915b"]]?.state?.(
        mockVariables,
      );
      expect(result?.to).toEqual([
        `"${mockVariables.submitterName}" <${mockVariables.submitterEmail}>`,
      ]);
      expect(result?.subject).toBe(
        `1915(b) Waiver ${mockVariables.id} Withdrawal Confirmation`,
      );
      expect(render).toHaveBeenCalledWith(
        <Waiver1915bStateEmail variables={mockVariables} />,
      );
    });
  });
});
