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
