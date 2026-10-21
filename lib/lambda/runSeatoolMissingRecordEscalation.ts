import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendEmailCommand, SendEmailCommandInput, SESClient } from "@aws-sdk/client-ses";
import {
  renderSeatoolMissingRecordEmail,
  SeatoolMissingRecordRow,
} from "libs/email/content/seatoolMissingRecord";
import { EmailAddresses } from "shared-types";
import { formatDateToET, getSecret } from "shared-utils";

import { formatEasternCalendarDatePath } from "./seatool-missing-record/cadence";
import {
  fetchMissingRecordCandidates,
  groupCandidatesByMailbox,
  MissingRecordCandidate,
} from "./seatool-missing-record/candidates";
import { getEscalationRecipients, MailboxGroup } from "./seatool-missing-record/recipients";

export const DEFAULT_MISSING_RECORD_PREFIX = "seatool-missing-record";
export const MAILBOX_GROUPS: MailboxGroup[] = ["medicaid-spa", "chip-spa", "waiver"];

export interface SeatoolMissingRecordEscalationResult {
  status: "sent" | "skipped";
  reason?: "already-sent" | "empty";
  sentGroups: MailboxGroup[];
  candidateCount: number;
  markerKey?: string;
}

function getStageName(): string {
  const stage = process.env.STAGE_NAME?.trim();
  if (!stage) {
    throw new Error("STAGE_NAME must be defined");
  }
  return stage;
}

function getBucketName(): string {
  const bucketName = (
    process.env.SEATOOL_MISSING_RECORD_BUCKET_NAME ||
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME ||
    ""
  ).trim();
  if (!bucketName) {
    throw new Error("SEATOOL_MISSING_RECORD_BUCKET_NAME must be defined");
  }
  return bucketName;
}

function getReportPrefix(): string {
  return (process.env.SEATOOL_MISSING_RECORD_PREFIX || DEFAULT_MISSING_RECORD_PREFIX).replace(
    /^\/+|\/+$/g,
    "",
  );
}

function getEmailAddressLookupSecretName(): string {
  const secretName = (process.env.emailAddressLookupSecretName || "emailAddresses").trim();
  if (!secretName) {
    throw new Error("emailAddressLookupSecretName must be defined");
  }
  return secretName;
}

function getRegion(): string {
  return process.env.region || process.env.AWS_REGION || "us-east-1";
}

function getApplicationEndpointUrl(): string {
  return process.env.applicationEndpointUrl || "https://onemac.cms.gov/";
}

export function buildSentMarkerPrefix(stage: string, now: Date = new Date()): string {
  const { year, month, day } = formatEasternCalendarDatePath(now);
  return `${getReportPrefix()}/${stage}/sent/${year}/${month}/${day}/`;
}

export function buildSentMarkerKey(stage: string, now: Date = new Date()): string {
  return `${buildSentMarkerPrefix(stage, now)}digest.json`;
}

function toEmailRows(candidates: MissingRecordCandidate[]): SeatoolMissingRecordRow[] {
  return candidates.map((candidate) => ({
    id: candidate.id,
    submissionDate: formatDateToET(candidate.submissionDate, "MM/dd/yyyy", false),
    authority: candidate.authority,
    daysSinceSubmit: candidate.daysSinceSubmit,
  }));
}

export function createMissingRecordEmailParams({
  to,
  cc,
  subject,
  body,
  sourceEmail,
}: {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  sourceEmail: string;
}): SendEmailCommandInput {
  return {
    Destination: {
      ToAddresses: to,
      CcAddresses: cc,
    },
    Message: {
      Body: {
        Html: { Data: body, Charset: "UTF-8" },
      },
      Subject: { Data: subject, Charset: "UTF-8" },
    },
    Source: sourceEmail,
  };
}

async function hasSentMarker(bucketName: string, prefix: string, region: string): Promise<boolean> {
  const s3 = new S3Client({ region });
  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: 1,
    }),
  );
  return (response.Contents ?? []).length > 0;
}

async function writeSentMarker(
  bucketName: string,
  key: string,
  body: object,
  region: string,
): Promise<void> {
  const s3 = new S3Client({ region });
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(body),
      ContentType: "application/json",
    }),
  );
}

export const handler = async (
  event: { now?: string } = {},
): Promise<SeatoolMissingRecordEscalationResult> => {
  const now = event.now ? new Date(event.now) : new Date();
  const stage = getStageName();
  const bucketName = getBucketName();
  const region = getRegion();
  const markerPrefix = buildSentMarkerPrefix(stage, now);
  const markerKey = buildSentMarkerKey(stage, now);

  if (await hasSentMarker(bucketName, markerPrefix, region)) {
    return {
      status: "skipped",
      reason: "already-sent",
      sentGroups: [],
      candidateCount: 0,
      markerKey,
    };
  }

  const candidates = await fetchMissingRecordCandidates(now);
  const groups = groupCandidatesByMailbox(candidates);
  const nonEmptyGroups = MAILBOX_GROUPS.filter((group) => groups[group].length > 0);

  if (nonEmptyGroups.length === 0) {
    return {
      status: "skipped",
      reason: "empty",
      sentGroups: [],
      candidateCount: 0,
    };
  }

  const emails: EmailAddresses = JSON.parse(await getSecret(getEmailAddressLookupSecretName()));
  const sourceEmail = emails.sourceEmail;
  if (!sourceEmail) {
    throw new Error("emailAddresses secret is missing sourceEmail");
  }

  const ses = new SESClient({ region });
  const sentGroups: MailboxGroup[] = [];

  for (const group of nonEmptyGroups) {
    const recipients = getEscalationRecipients(stage, group, emails);
    if (recipients.to.length === 0) {
      continue;
    }

    const template = await renderSeatoolMissingRecordEmail({
      to: recipients.to,
      cc: recipients.cc,
      applicationEndpointUrl: getApplicationEndpointUrl(),
      packages: toEmailRows(groups[group]),
    });
    const params = createMissingRecordEmailParams({
      to: template.to,
      cc: template.cc ?? [],
      subject: template.subject,
      body: template.body,
      sourceEmail,
    });
    await ses.send(new SendEmailCommand(params));
    sentGroups.push(group);
  }

  if (sentGroups.length === 0) {
    return {
      status: "skipped",
      reason: "empty",
      sentGroups: [],
      candidateCount: candidates.length,
    };
  }

  await writeSentMarker(
    bucketName,
    markerKey,
    {
      sentAt: now.toISOString(),
      stage,
      sentGroups,
      candidateCount: candidates.length,
    },
    region,
  );

  return {
    status: "sent",
    sentGroups,
    candidateCount: candidates.length,
    markerKey,
  };
};
