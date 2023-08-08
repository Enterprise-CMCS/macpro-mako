export type SeatoolData = {
  ID: string;
  SUBMISSION_DATE: number;
  PLAN_TYPE: string; // should be enum
  STATE_CODE: string; // should be enum
  STATE_PLAN: {
    SUMMARY_MEMO?: string;
  };
  SPW_STATUS?: {
    SPW_STATUS_DESC: string;
  }[];
};
