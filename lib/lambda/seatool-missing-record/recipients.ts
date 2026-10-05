import { EmailAddresses } from "shared-types";

export const NON_PRODUCTION_TO_ADDRESSES = ["benjamin.paige@cms.hhs.gov"] as const;
export const PRODUCTION_CC_ADDRESSES = [
  "seatool_helpdesk@cms.hhs.gov",
  "DPOApprover@cms.hhs.gov",
] as const;

export type MailboxGroup = "medicaid-spa" | "chip-spa" | "waiver";

export interface EscalationRecipients {
  to: string[];
  cc: string[];
}

export function isProductionStage(stage: string): boolean {
  return stage === "production";
}

export function productionToAddresses(group: MailboxGroup, emails: EmailAddresses): string[] {
  switch (group) {
    case "medicaid-spa":
    case "waiver":
      return [...emails.osgEmail];
    case "chip-spa":
      return [...emails.chipInbox];
    default: {
      const exhaustive: never = group;
      throw new Error(`Unexpected mailbox group: ${exhaustive}`);
    }
  }
}

export function getEscalationRecipients(
  stage: string,
  group: MailboxGroup,
  emails: EmailAddresses,
): EscalationRecipients {
  if (!isProductionStage(stage)) {
    return {
      to: [...NON_PRODUCTION_TO_ADDRESSES],
      cc: [],
    };
  }

  return {
    to: productionToAddresses(group, emails),
    cc: [...PRODUCTION_CC_ADDRESSES],
  };
}
