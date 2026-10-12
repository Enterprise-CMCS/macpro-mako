import { render } from "@react-email/render";

import { SeatoolMissingRecordEmail } from "./emailTemplates/SeatoolMissingRecordEmail";
import { SEATOOL_MISSING_RECORD_SUBJECT, SeatoolMissingRecordRow } from "./types";

export { SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL, SEATOOL_MISSING_RECORD_SUBJECT } from "./types";
export type { SeatoolMissingRecordRow } from "./types";
export { SeatoolMissingRecordEmail } from "./emailTemplates/SeatoolMissingRecordEmail";

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
}> {
  return {
    to,
    cc,
    subject: SEATOOL_MISSING_RECORD_SUBJECT,
    body: await render(
      <SeatoolMissingRecordEmail
        applicationEndpointUrl={applicationEndpointUrl}
        packages={packages}
      />,
    ),
  };
}
