import type { opensearch } from "shared-types";
import { events } from "shared-types/events";

type ShapeLike = {
  shape: Record<string, unknown>;
};

type SafeParseLike = {
  safeParse: (value: unknown) => { success: boolean; data?: unknown };
};

const hasBaseSchema = (eventModule: unknown): eventModule is { baseSchema: unknown } =>
  typeof eventModule === "object" && eventModule !== null && "baseSchema" in eventModule;

const hasShape = (schema: unknown): schema is ShapeLike =>
  typeof schema === "object" &&
  schema !== null &&
  "shape" in schema &&
  typeof (schema as { shape?: unknown }).shape === "object" &&
  (schema as { shape?: unknown }).shape !== null;

const hasSafeParse = (schema: unknown): schema is SafeParseLike =>
  typeof schema === "object" &&
  schema !== null &&
  "safeParse" in schema &&
  typeof (schema as { safeParse?: unknown }).safeParse === "function";

const getDraftAttachmentShape = (eventName?: opensearch.main.Document["event"]) => {
  if (!eventName || !(eventName in events)) {
    return undefined;
  }

  const eventModule = events[eventName as keyof typeof events];
  if (!hasBaseSchema(eventModule) || !hasShape(eventModule.baseSchema)) {
    return undefined;
  }

  const attachmentsSchema = (eventModule.baseSchema.shape as Record<string, unknown>).attachments;
  if (!hasShape(attachmentsSchema)) {
    return undefined;
  }

  return attachmentsSchema.shape;
};

export const getDraftAttachmentKeyOrder = (eventName?: opensearch.main.Document["event"]) =>
  Object.keys(getDraftAttachmentShape(eventName) ?? {});

export const getDraftAttachmentDefaultLabel = (
  eventName: opensearch.main.Document["event"] | undefined,
  attachmentKey: string,
) => {
  const attachmentShape = getDraftAttachmentShape(eventName);
  if (!attachmentShape) {
    return undefined;
  }

  const attachmentSchema = attachmentShape[attachmentKey];
  if (!hasShape(attachmentSchema)) {
    return undefined;
  }

  const labelSchema = attachmentSchema.shape.label;
  if (!hasSafeParse(labelSchema)) {
    return undefined;
  }

  const labelResult = labelSchema.safeParse(undefined);
  return labelResult.success &&
    typeof labelResult.data === "string" &&
    labelResult.data.trim().length > 0
    ? labelResult.data.trim()
    : undefined;
};

const humanizeDraftAttachmentKey = (key: string) =>
  key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());

export const getDraftAttachments = (
  submission?: opensearch.main.Document,
): NonNullable<opensearch.changelog.Document["attachments"]> => {
  const attachmentSections = (submission?.draft?.data as Record<string, unknown> | undefined)
    ?.attachments;

  if (!attachmentSections || typeof attachmentSections !== "object") {
    return [];
  }

  const attachmentKeyOrder = getDraftAttachmentKeyOrder(submission?.event);
  const attachmentKeyOrderIndex = new Map(
    attachmentKeyOrder.map((attachmentKey, index) => [attachmentKey, index]),
  );
  const orderedAttachmentEntries = Object.entries(attachmentSections)
    .map(([attachmentKey, attachmentSection], originalIndex) => ({
      attachmentKey,
      attachmentSection,
      originalIndex,
      sortIndex: attachmentKeyOrderIndex.get(attachmentKey) ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((left, right) => {
      if (left.sortIndex !== right.sortIndex) {
        return left.sortIndex - right.sortIndex;
      }

      return left.originalIndex - right.originalIndex;
    });

  return orderedAttachmentEntries.flatMap(({ attachmentKey, attachmentSection }) => {
    if (!attachmentSection || typeof attachmentSection !== "object") {
      return [];
    }

    const sectionLabel =
      typeof (attachmentSection as { label?: unknown }).label === "string" &&
      (attachmentSection as { label?: string }).label?.trim()
        ? (attachmentSection as { label: string }).label.trim()
        : (getDraftAttachmentDefaultLabel(submission?.event, attachmentKey) ??
          humanizeDraftAttachmentKey(attachmentKey));

    const files = (attachmentSection as { files?: unknown }).files;
    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }

    return files.flatMap((file) => {
      if (!file || typeof file !== "object") {
        return [];
      }

      const maybeAttachment = file as Record<string, unknown>;
      const filename =
        typeof maybeAttachment.filename === "string" ? maybeAttachment.filename : undefined;
      const bucket =
        typeof maybeAttachment.bucket === "string" ? maybeAttachment.bucket : undefined;
      const key = typeof maybeAttachment.key === "string" ? maybeAttachment.key : undefined;
      const uploadDate =
        typeof maybeAttachment.uploadDate === "number" ? maybeAttachment.uploadDate : undefined;
      if (!filename || !bucket || !key || typeof uploadDate !== "number") {
        return [];
      }

      return [
        {
          filename,
          bucket,
          key,
          uploadDate,
          title: sectionLabel,
        },
      ];
    });
  });
};
