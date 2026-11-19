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
  // seatoolMissingRecordTo overrides the production mailboxes when set, so
  // production can be routed to a test inbox without editing osgEmail or
  // chipInbox, which other package notification emails depend on.
  // when confident that the override is working, remove this property in the emailAddresses
  const overrideTo = asEmailList(emails.seatoolMissingRecordTo);
  if (overrideTo.length > 0 || !isProductionStage(stage)) {
    return {
      to: overrideTo,
      cc: [],
    };
  }

  return {
    to: productionToAddresses(group, emails),
    cc: productionCcAddresses(emails),
  };
}
