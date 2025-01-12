import { CommonEmailVariables, EmailAddresses, Events } from "shared-types";

export interface EmailProps {
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
  relatedEvent: Events["WithdrawRai"] | null;
}

export { MedSpaCMSEmail } from "./MedSpaCMS";
export { MedSpaStateEmail } from "./MedSpaState";
export { ChipSpaCMSEmail } from "./ChipSpaCMS";
export { ChipSpaStateEmail } from "./ChipSpaState";
export { Waiver1915bCMSEmail } from "./Waiver1915bCMS";
export { Waiver1915bStateEmail } from "./Waiver1915bState";
export { AppKCMSEmail } from "./AppKCMS";
export { AppKStateEmail } from "./AppKState";
