import {
  buildSeatoolMissingRecordEmailHtml,
  buildSeatoolMissingRecordEmailText,
} from "./emailTemplates/SeatoolMissingRecordEmail";
import { SEATOOL_MISSING_RECORD_SUBJECT, SeatoolMissingRecordRow } from "./types";

export { SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL, SEATOOL_MISSING_RECORD_SUBJECT } from "./types";
export type { SeatoolMissingRecordRow } from "./types";
export {
  buildSeatoolMissingRecordEmailHtml,
  buildSeatoolMissingRecordEmailText,
  SEA_TOOL_URL,
} from "./emailTemplates/SeatoolMissingRecordEmail";

export function seatoolMissingRecordSubject(packages: SeatoolMissingRecordRow[]): string {
  const [onlyPackage] = packages;
  if (packages.length === 1 && onlyPackage) {
    return `${onlyPackage.id} - ${SEATOOL_MISSING_RECORD_SUBJECT}`;
  }

  return SEATOOL_MISSING_RECORD_SUBJECT;
}

export async function renderSeatoolMissingRecordEmail({
  to,
  cc = [],
  packages,
  applicationEndpointUrl,
}: {
  to: string[];
  cc?: string[];
  packages: SeatoolMissingRecordRow[];
  applicationEndpointUrl: string;
}): Promise<{
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  text: string;
}> {
  return {
    to,
    cc,
    subject: seatoolMissingRecordSubject(packages),
    body: buildSeatoolMissingRecordEmailHtml({ packages, applicationEndpointUrl }),
    text: buildSeatoolMissingRecordEmailText(packages),
  };
}
