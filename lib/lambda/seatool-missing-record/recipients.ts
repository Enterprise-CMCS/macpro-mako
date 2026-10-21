import { EmailAddresses } from "shared-types";

export type MailboxGroup = "medicaid-spa" | "chip-spa" | "waiver";

export interface EscalationRecipients {
  to: string[];
  cc: string[];
}

export function isProductionStage(stage: string): boolean {
  return stage === "production";
}

export function asEmailList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

export function productionToAddresses(group: MailboxGroup, emails: EmailAddresses): string[] {
  switch (group) {
    case "medicaid-spa":
    case "waiver":
      return asEmailList(emails.osgEmail);
    case "chip-spa":
      return asEmailList(emails.chipInbox);
    default: {
      const exhaustive: never = group;
      throw new Error(`Unexpected mailbox group: ${exhaustive}`);
    }
  }
}

export function productionCcAddresses(emails: EmailAddresses): string[] {
  return [...asEmailList(emails.seatoolHelpdesk), ...asEmailList(emails.dpoApprover)];
}

export function getEscalationRecipients(
  stage: string,
  group: MailboxGroup,
  emails: EmailAddresses,
): EscalationRecipients {
  if (!isProductionStage(stage)) {
    return {
      to: asEmailList(emails.seatoolMissingRecordTo),
      cc: [],
    };
  }

  return {
    to: productionToAddresses(group, emails),
    cc: productionCcAddresses(emails),
  };
}
