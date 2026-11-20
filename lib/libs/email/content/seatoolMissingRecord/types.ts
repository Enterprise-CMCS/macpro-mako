export const SEATOOL_MISSING_RECORD_SUBJECT = "ACTION REQUIRED - No matching record in SEA Tool";
export const SEATOOL_MISSING_RECORD_HELP_DESK_EMAIL = "OneMAC_HelpDesk@cms.hhs.gov";

export interface SeatoolMissingRecordRow {
  id: string;
  submissionDate: string;
  authority: string;
  daysSinceSubmit: number;
}
