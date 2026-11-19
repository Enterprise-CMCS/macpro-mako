import { SEATOOL_STATUS } from "shared-types";

import { ATTACHMENT_BUCKET_NAME, USER_POOL_CLIENT_ID } from "../consts";
import type { TestItemResult } from "../index.d";

/** Playwright sets this before app boot so mocked mode can switch users. */
export const MOCK_USERNAME_OVERRIDE_KEY = "mako-mock-username";

/** Valid CEntra id that the mocked submit handler rejects with HTTP 500. */
export const CENTRA_SUBMISSION_ERROR_ITEM_ID = "MD-CE-26-500";

const SESSION_KEY = "mako-centra-session";
const SUBMITTED_AT = "2026-03-20T15:00:00.000Z";
const SUBMITTED_MS = Date.parse(SUBMITTED_AT);

type AttachmentFile = {
  filename: string;
  title?: string;
  bucket?: string;
  key?: string;
  uploadDate?: number;
};

type AttachmentSlot = {
  label?: string;
  files?: AttachmentFile[];
};

export type CentraSubmitBody = {
  id?: string;
  event?: string;
  state?: string;
  authority?: string;
  hardshipKind?: string;
  proposedEffectiveDate?: number;
  additionalInformation?: string | null;
  attachments?: {
    ceTemplate?: AttachmentSlot;
    other?: AttachmentSlot;
  };
  submitterName?: string;
  submitterEmail?: string;
  timestamp?: number;
};

export type CentraDraftBody = {
  id?: string;
  originalDraftId?: string;
  event?: string;
  authority?: string;
  draftData?: Record<string, unknown>;
  ifSeqNo?: number;
  ifPrimaryTerm?: number;
};

type CentraMutations = {
  items: Record<string, TestItemResult>;
  deletedIds: string[];
};

const memoryMutations: CentraMutations = { items: {}, deletedIds: [] };

const emptyMutations = (): CentraMutations => ({ items: {}, deletedIds: [] });

const sessionStore = (): Storage | null => {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
};

const readMutations = (): CentraMutations => {
  const store = sessionStore();
  if (!store) return memoryMutations;
  const raw = store.getItem(SESSION_KEY);
  if (!raw) return emptyMutations();
  try {
    const parsed = JSON.parse(raw) as CentraMutations;
    return {
      items: parsed.items ?? {},
      deletedIds: parsed.deletedIds ?? [],
    };
  } catch {
    return emptyMutations();
  }
};

const writeMutations = (mutations: CentraMutations) => {
  const store = sessionStore();
  if (!store) {
    memoryMutations.items = mutations.items;
    memoryMutations.deletedIds = mutations.deletedIds;
    return;
  }
  store.setItem(SESSION_KEY, JSON.stringify(mutations));
};

const submitterFromMockUser = () => {
  const fallback = { email: "mako.stateuser@gmail.com", name: "Stateuser Tester" };
  try {
    if (typeof localStorage === "undefined") return fallback;
    const username = localStorage.getItem(
      `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.LastAuthUser`,
    );
    if (!username) return fallback;
    const raw = localStorage.getItem(
      `CognitoIdentityServiceProvider.${USER_POOL_CLIENT_ID}.${username}.userData`,
    );
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as {
      UserAttributes?: { Name?: string; Value?: string }[];
    };
    const attribute = (name: string) =>
      parsed.UserAttributes?.find((entry) => entry.Name === name)?.Value;
    const email = attribute("email") || fallback.email;
    const given = attribute("given_name") || "Stateuser";
    const family = attribute("family_name") || "Tester";
    return { email, name: `${given} ${family}`.trim() };
  } catch {
    return fallback;
  }
};

const normalizeFiles = (slot: AttachmentSlot | undefined): AttachmentFile[] =>
  (slot?.files ?? []).map((file) => ({
    filename: file.filename,
    title: file.title || file.filename,
    bucket: file.bucket || ATTACHMENT_BUCKET_NAME,
    key: file.key || file.filename,
    uploadDate: file.uploadDate || Date.now(),
  }));

const slot = (label: string, files: AttachmentFile[]) => ({
  label,
  files,
});

const flattenFiles = (label: string, files: AttachmentFile[]) =>
  files.map((file) => ({
    filename: file.filename,
    title: label,
    bucket: file.bucket,
    key: file.key,
    uploadDate: file.uploadDate,
  }));

const changelogEntry = (
  packageId: string,
  offset: number,
  event: string,
  submitterName: string,
  additionalInformation: string | null | undefined,
  attachments: {
    filename: string;
    title: string;
    bucket?: string;
    key?: string;
    uploadDate?: number;
  }[],
  timestamp: number,
) => ({
  _id: `${packageId}-${offset}`,
  found: true,
  _source: {
    id: `${packageId}-${offset}`,
    packageId,
    event,
    timestamp,
    submitterName,
    additionalInformation: additionalInformation ?? "",
    attachments,
  },
});

const submittedRecord = (
  id: string,
  hardshipKind: string,
  additionalInformation: string,
  templateFiles: AttachmentFile[],
  otherFiles: AttachmentFile[],
  submitterName: string,
  submitterEmail: string,
  timestamp: number,
  proposedDate: number,
): TestItemResult => {
  const iso = new Date(timestamp).toISOString();
  const proposedIso = new Date(proposedDate).toISOString();
  const attachments = [
    ...flattenFiles("Template", templateFiles),
    ...flattenFiles("Other Supporting Documentation", otherFiles),
  ];
  return {
    _id: id,
    found: true,
    _seq_no: 1,
    _primary_term: 1,
    _source: {
      id,
      authority: "CE_HARDSHIP_EXCEPTION",
      hardshipKind,
      state: id.slice(0, 2),
      origin: "OneMAC",
      event: "ce-record-submitted",
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      stateStatus: "Submitted",
      cmsStatus: "Submitted - Intake Needed",
      initialIntakeNeeded: true,
      submitterName,
      submitterEmail,
      submissionDate: iso,
      proposedDate: proposedIso,
      makoChangedDate: iso,
      changedDate: iso,
      additionalInformation,
      attachments: {
        ceTemplate: slot("Template", templateFiles),
        other: slot("Other Supporting Documentation", otherFiles),
      },
      changelog: [
        changelogEntry(
          id,
          1,
          "ce-record-submitted",
          submitterName,
          additionalInformation,
          attachments,
          timestamp,
        ),
      ],
    },
  } as unknown as TestItemResult;
};

const seedPackages = (): Record<string, TestItemResult> => {
  const template = [
    {
      filename: "centra-template.pdf",
      title: "centra-template",
      bucket: ATTACHMENT_BUCKET_NAME,
      key: "centra-template.pdf",
      uploadDate: SUBMITTED_MS,
    },
  ];
  const unemployment = submittedRecord(
    "MD-CE-26-001",
    "CE_UNEMPLOYMENT",
    "Initial hardship request",
    template,
    [],
    "Riley Quinn",
    "riley.quinn@example.com",
    SUBMITTED_MS,
    SUBMITTED_MS,
  );
  const stafford = submittedRecord(
    "MD-CE-26-002",
    "CE_SADE",
    "Stafford Act request",
    template,
    [],
    "Riley Quinn",
    "riley.quinn@example.com",
    SUBMITTED_MS,
    SUBMITTED_MS,
  );
  const emergencies = submittedRecord(
    "MD-CE-26-003",
    "CE_NEA",
    "National emergency request",
    template,
    [],
    "Riley Quinn",
    "riley.quinn@example.com",
    SUBMITTED_MS,
    SUBMITTED_MS,
  );

  return {
    "MD-CE-26-001": unemployment,
    "MD-CE-26-002": stafford,
    "MD-CE-26-003": emergencies,
  };
};

const mergedItems = (): Record<string, TestItemResult> => ({
  ...seedPackages(),
  ...readMutations().items,
});

export const resetCentraSession = () => {
  writeMutations(emptyMutations());
};

export const getCentraItem = (id: string | undefined | null): TestItemResult | undefined => {
  if (!id) return undefined;
  const item = mergedItems()[id];
  if (!item) return undefined;
  if (readMutations().deletedIds.includes(id)) {
    return {
      ...item,
      _source: {
        ...item._source,
        deleted: true,
      },
    };
  }
  return item;
};

export const listCentraSearchHits = (): TestItemResult[] => {
  const deleted = new Set(readMutations().deletedIds);
  return Object.values(mergedItems()).filter((item) => item._id && !deleted.has(item._id));
};

const persistItem = (id: string, item: TestItemResult) => {
  const mutations = readMutations();
  mutations.items[id] = item;
  mutations.deletedIds = mutations.deletedIds.filter((deletedId) => deletedId !== id);
  writeMutations(mutations);
};

const markDeleted = (id: string) => {
  const mutations = readMutations();
  if (!mutations.deletedIds.includes(id)) mutations.deletedIds.push(id);
  writeMutations(mutations);
};

export const recordCentraDraft = (
  body: CentraDraftBody,
): { conflict: boolean; message: string; id: string; seqNo?: number; primaryTerm?: number } => {
  const id = body.id?.trim().toUpperCase() ?? "";
  if (!id) {
    return { conflict: true, message: "Event body required", id };
  }

  const existing = getCentraItem(id);
  const isActiveDraft =
    existing?._source?.seatoolStatus === SEATOOL_STATUS.DRAFT && existing._source.deleted !== true;
  if (
    isActiveDraft &&
    typeof body.ifSeqNo === "number" &&
    typeof body.ifPrimaryTerm === "number" &&
    (existing?._seq_no !== body.ifSeqNo || existing?._primary_term !== body.ifPrimaryTerm)
  ) {
    return { conflict: true, message: "Draft version conflict", id };
  }

  const draftData = body.draftData ?? {};
  const hardshipKind =
    typeof draftData.hardshipKind === "string" ? draftData.hardshipKind : undefined;
  const state = typeof draftData.state === "string" ? draftData.state : id.slice(0, 2);
  const actor = submitterFromMockUser();
  const now = new Date().toISOString();
  const seqNo = (existing?._seq_no ?? 0) + 1;
  const primaryTerm = (existing?._primary_term ?? 0) + 1;
  const createdByEmail = existing?._source?.draft?.createdByEmail || actor.email;
  const createdByName = existing?._source?.draft?.createdByName || actor.name;

  persistItem(id, {
    _id: id,
    found: true,
    _seq_no: seqNo,
    _primary_term: primaryTerm,
    _source: {
      id,
      authority: body.authority || "CE_HARDSHIP_EXCEPTION",
      hardshipKind,
      state,
      origin: "OneMAC",
      event: body.event || "ce-record-submitted",
      seatoolStatus: SEATOOL_STATUS.DRAFT,
      stateStatus: "Draft",
      cmsStatus: "Draft",
      submitterName: createdByName,
      submitterEmail: createdByEmail,
      makoChangedDate: now,
      changedDate: now,
      draft: {
        savedAt: now,
        createdAt: existing?._source?.draft?.createdAt || now,
        createdByEmail,
        createdByName,
        updatedAt: now,
        updatedByEmail: actor.email,
        updatedByName: actor.name,
        draftOwnerEmail: createdByEmail,
        draftOwnerName: createdByName,
        data: { ...draftData, id },
      },
      changelog: [],
    },
  } as unknown as TestItemResult);

  if (body.originalDraftId && body.originalDraftId.toUpperCase() !== id) {
    markDeleted(body.originalDraftId.toUpperCase());
  }

  return { conflict: false, message: "Draft saved", id, seqNo, primaryTerm };
};

export const deleteCentraDraft = (id: string): { ok: boolean; message: string } => {
  const item = getCentraItem(id);
  if (
    !item?._source ||
    item._source.seatoolStatus !== SEATOOL_STATUS.DRAFT ||
    item._source.deleted
  ) {
    return { ok: false, message: "Package is not an active draft." };
  }
  markDeleted(id);
  return { ok: true, message: "Draft deleted" };
};

export const recordCentraSubmission = (body: CentraSubmitBody): TestItemResult | undefined => {
  const id = body.id?.trim().toUpperCase();
  if (!id || id === CENTRA_SUBMISSION_ERROR_ITEM_ID) return undefined;

  const actor = submitterFromMockUser();
  const submitterName = body.submitterName || actor.name;
  const submitterEmail = body.submitterEmail || actor.email;
  const timestamp = body.timestamp || Date.now();
  const templateFiles = normalizeFiles(body.attachments?.ceTemplate);
  const otherFiles = normalizeFiles(body.attachments?.other);

  if (body.event === "ce-subsequent-documents") {
    const existing = getCentraItem(id);
    if (!existing?._source || existing._source.deleted) return existing;
    const priorChangelog = existing._source.changelog ?? [];
    const offset = priorChangelog.length + 1;
    const attachments = [
      ...flattenFiles("Template", templateFiles),
      ...flattenFiles("Other Supporting Documentation", otherFiles),
    ];
    const iso = new Date(timestamp).toISOString();
    const existingTemplate = (existing._source.attachments?.ceTemplate?.files ??
      []) as AttachmentFile[];
    const existingOther = (existing._source.attachments?.other?.files ?? []) as AttachmentFile[];
    const next: TestItemResult = {
      ...existing,
      _source: {
        ...existing._source,
        hardshipKind: body.hardshipKind || existing._source.hardshipKind,
        makoChangedDate: iso,
        changedDate: iso,
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        stateStatus: "Submitted",
        cmsStatus: "Submitted - Intake Needed",
        attachments: {
          ceTemplate: slot("Template", [...existingTemplate, ...templateFiles]),
          other: slot("Other Supporting Documentation", [...existingOther, ...otherFiles]),
        },
        changelog: [
          changelogEntry(
            id,
            offset,
            "ce-subsequent-documents",
            submitterName,
            body.additionalInformation,
            attachments,
            timestamp,
          ),
          ...priorChangelog,
        ],
      },
    } as unknown as TestItemResult;
    persistItem(id, next);
    return next;
  }

  const proposedDate =
    typeof body.proposedEffectiveDate === "number" ? body.proposedEffectiveDate : timestamp;
  const record = submittedRecord(
    id,
    body.hardshipKind || "CE_UNEMPLOYMENT",
    body.additionalInformation ?? "",
    templateFiles,
    otherFiles,
    submitterName,
    submitterEmail,
    timestamp,
    proposedDate,
  );
  persistItem(id, record);
  return record;
};

export const isCentraPackageId = (id: string | undefined | null): boolean =>
  typeof id === "string" && /^[A-Z]{2}-CE-[0-9]{2}-[0-9]{3}$/.test(id.trim().toUpperCase());
