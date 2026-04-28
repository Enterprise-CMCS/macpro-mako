import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
import { events, getStatus } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";
import { z } from "zod";

import { submitNOSOAdminSchema } from "./adminChangeSchemas";

/** @typedef {object} json
 * @property {object} body
 * @property {string} body.id
 * @property {string} body.authority
 * @property {string} body.status
 * @property {string | null} [body.submitterEmail]
 * @property {string | null} [body.submitterName]
 * @property {string} body.adminChangeType
 * @property {string} body.mockEvent
 * @property {string} body.changeMade
 * @property {string} body.changeReason
 */
interface submitMessageType {
  id: string;
  authority: string;
  status: string;
  submitterEmail?: string | null;
  submitterName?: string | null;
  submissionDate: string;
  proposedDate: string;
  adminChangeType: string;
  stateStatus: string;
  cmsStatus: string;
  changeMade: string;
  changeReason: string;
  mockEvent: string;
  attachments?: Record<string, { label: string; files?: unknown[] }>;
}

class InvalidNOSORequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidNOSORequestError";
  }
}

const nosoMockEvents = [
  "app-k",
  "capitated-amendment",
  "capitated-initial",
  "capitated-renewal",
  "contracting-amendment",
  "contracting-initial",
  "contracting-renewal",
  "new-chip-details-submission",
  "new-chip-submission",
  "new-medicaid-submission",
  "temporary-extension",
] as const;

type NosoMockEvent = (typeof nosoMockEvents)[number];

const isNosoMockEvent = (mockEvent: string): mockEvent is NosoMockEvent =>
  nosoMockEvents.includes(mockEvent as NosoMockEvent);

const isZodObjectSchema = (schema: z.ZodTypeAny): schema is z.AnyZodObject =>
  schema._def.typeName === z.ZodFirstPartyTypeKind.ZodObject;

const isZodOptionalSchema = (schema: z.ZodTypeAny) =>
  schema._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional;

function getEventBaseSchema(eventName: NosoMockEvent): z.AnyZodObject {
  const eventModule = events[eventName];

  if (!("baseSchema" in eventModule) || !eventModule.baseSchema) {
    throw new InvalidNOSORequestError(`Package event ${eventName} does not support attachments.`);
  }

  return eventModule.baseSchema as z.AnyZodObject;
}

function getMockEventAttachmentsSchema(eventName: NosoMockEvent) {
  const baseSchema = getEventBaseSchema(eventName);
  const attachmentsSchema = (baseSchema.shape as Record<string, z.ZodTypeAny>).attachments;

  if (!isZodObjectSchema(attachmentsSchema)) {
    throw new InvalidNOSORequestError(`Package event ${eventName} does not support attachments.`);
  }

  const normalizedShape = Object.fromEntries(
    Object.entries(attachmentsSchema.shape).map(([key, value]) => {
      if (!isZodObjectSchema(value)) {
        return [key, value];
      }

      const filesSchema = (value.shape as Record<string, z.ZodTypeAny>).files;
      return [key, isZodOptionalSchema(filesSchema) ? value.optional() : value];
    }),
  );

  return z.object(normalizedShape);
}

function validateAttachmentsForMockEvent(item: z.infer<typeof submitNOSOAdminSchema>) {
  if (!isNosoMockEvent(item.mockEvent)) {
    throw new InvalidNOSORequestError(`Unsupported NOSO mockEvent: ${item.mockEvent}`);
  }

  if (!item.attachments) {
    return item;
  }

  const attachmentsSchema = getMockEventAttachmentsSchema(item.mockEvent);
  const attachments = attachmentsSchema.parse(item.attachments);
  return {
    ...item,
    attachments,
  };
}

const convertStringToTimestamp = (date: string) => {
  const formatedDate = new Date(date).getTime();
  if (isNaN(formatedDate)) throw new Error("Not a valid time");
  return formatedDate;
};

const sendSubmitMessage = async (item: submitMessageType) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  const currentTime = Date.now();
  const formattedId = item.id.toUpperCase();
  const formattedSubmittedDate = convertStringToTimestamp(item.submissionDate);
  const formattedProposedDate = convertStringToTimestamp(item.proposedDate);

  await produceMessage(
    topicName,
    formattedId,
    JSON.stringify({
      ...item,
      id: formattedId,
      packageId: formattedId,
      origin: "SEATool",
      isAdminChange: true,
      adminChangeType: "NOSO",
      description: null,
      event: "NOSO",
      state: item.id.substring(0, 2),
      submissionDate: formattedSubmittedDate,
      proposedDate: formattedProposedDate,
      makoChangedDate: currentTime,
      changedDate: currentTime,
      statusDate: currentTime,
      timestamp: currentTime,
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `${item.id} has been submitted.` },
  });
};

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const parsedItem = submitNOSOAdminSchema.parse(
      typeof event.body === "string" ? JSON.parse(event.body) : event.body,
    );
    const item = validateAttachmentsForMockEvent(parsedItem);

    let status: string = item.status;
    // check if it already exists in onemac - should exist in SEATool
    const currentPackage: ItemResult | undefined = await getPackage(item.id.toUpperCase());

    if (currentPackage && currentPackage.found == true) {
      // we should default to the current status in SEATool, and use entered status as a backup
      status = currentPackage._source?.seatoolStatus ?? item.status;
      // if it exists and has origin OneMAC we shouldn't override it
      if (currentPackage._source.origin === "OneMAC") {
        return response({
          statusCode: 400,
          body: { message: `Package with id: ${item.id} already exists.` },
        });
      }
    }

    const { stateStatus, cmsStatus } = getStatus(status);
    return await sendSubmitMessage({ ...item, stateStatus, cmsStatus });
  } catch (err) {
    console.error("Error has occured submitting package:", err);
    if (err instanceof z.ZodError || err instanceof InvalidNOSORequestError) {
      return response({
        statusCode: 400,
        body: { message: err instanceof z.ZodError ? err.errors : err.message },
      });
    }

    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
