import { STATE_CODES, type StateCode } from "./states";

/** Community Engagement Short-Term Hardship Exception (CEntra) shared contract. */
export const CE_HARDSHIP_EXCEPTION_AUTHORITY = "CE_HARDSHIP_EXCEPTION" as const;

/** SPAs grid and Package Details label. Stored authority remains the code above. */
export const CE_HARDSHIP_EXCEPTION_LABEL = "CE Hardship Exception";

export const CE_EVENT = {
  RECORD_SUBMITTED: "ce-record-submitted",
  SUBSEQUENT_DOCUMENTS: "ce-subsequent-documents",
} as const;

export const CE_OPERATION_TYPE = {
  RECORD_SUBMITTED: "CE_RECORD_SUBMITTED",
  SUBSEQUENT_DOCUMENTS: "CE_SUBSEQUENT_DOCUMENTS",
} as const;

export const CE_PACKAGE_ID_REGEX = /^[A-Z]{2}-CE-[0-9]{2}-[0-9]{3}$/;

export const CE_PACKAGE_ID_FORMAT_MESSAGE = "ID must match format SS-CE-YY-###";

export const CE_ADDITIONAL_INFORMATION_MAX_LENGTH = 4000;

export const CE_HARDSHIP_KIND_CODES = ["CE_UNEMPLOYMENT", "CE_SADE", "CE_NEA"] as const;

export type CeHardshipKindCode = (typeof CE_HARDSHIP_KIND_CODES)[number];

export const CE_HARDSHIP_KIND_LABELS: Record<CeHardshipKindCode, string> = {
  CE_UNEMPLOYMENT: "High Unemployment Requests",
  CE_SADE: "Stafford Act Disaster and Emergency Requests",
  CE_NEA: "National Emergencies Act Requests",
};

export const CE_ATTACHMENT_LABELS = {
  ceTemplate: "Template",
  other: "Other Supporting Documentation",
} as const;

export interface CeAttachmentFile {
  filename: string;
  title: string;
  bucket: string;
  key: string;
  /** Epoch milliseconds. */
  uploadDate: number;
}

export interface CeAttachmentSlot {
  label: string;
  files: CeAttachmentFile[];
}

export interface CeAttachments {
  /** Label: "Template". */
  ceTemplate: CeAttachmentSlot;
  /** Label: "Other Supporting Documentation". */
  other: CeAttachmentSlot;
}

export interface CeRecordSubmitted {
  origin: "mako";
  event: typeof CE_EVENT.RECORD_SUBMITTED;
  operationType: typeof CE_OPERATION_TYPE.RECORD_SUBMITTED;
  id: string;
  state: string;
  authority: typeof CE_HARDSHIP_EXCEPTION_AUTHORITY;
  hardshipKind: CeHardshipKindCode;
  /** Submission Date, epoch milliseconds. */
  proposedEffectiveDate: number;
  additionalInformation: string | null;
  submitterName: string;
  submitterEmail: string;
  timestamp: number;
  attachments: CeAttachments;
}

export interface CeSubsequentDocuments {
  origin: "mako";
  event: typeof CE_EVENT.SUBSEQUENT_DOCUMENTS;
  operationType: typeof CE_OPERATION_TYPE.SUBSEQUENT_DOCUMENTS;
  id: string;
  state: string;
  authority: typeof CE_HARDSHIP_EXCEPTION_AUTHORITY;
  hardshipKind: CeHardshipKindCode;
  /** Required reason. Non-whitespace, at most 4,000 characters. */
  additionalInformation: string;
  submitterName: string;
  submitterEmail: string;
  timestamp: number;
  attachments: CeAttachments;
}

export type CommunityEngagementOutboundEvent = CeRecordSubmitted | CeSubsequentDocuments;

export function isKnownStateCode(value: string): value is StateCode {
  return (STATE_CODES as readonly string[]).includes(value);
}

/** Shape plus a known `STATE_CODES` prefix. Submitter authorization is enforced on submit. */
export function isCePackageId(id: string): boolean {
  return CE_PACKAGE_ID_REGEX.test(id) && isKnownStateCode(id.slice(0, 2));
}
