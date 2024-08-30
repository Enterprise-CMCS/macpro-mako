import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";
import { APIGatewayEvent } from "aws-lambda";
import {
  getAuthDetails,
  isAuthorized,
  lookupUserAttributes,
} from "../../../libs/api/auth/user"; // this should move
import { itemExists } from "libs/api/package";

// These are fields we expect the frontend to provide in the api request's payload
export const feSchema = z.object({
  event: z
    .literal("new-medicaid-submission")
    .default("new-medicaid-submission"),
  additionalInformation: z.string().max(4000).nullable().default(null),
  attachments: z.object({
    cmsForm179: z.object({
      files: attachmentArraySchema({
        max: 1,
        message: "Required: You must submit exactly one file for CMS Form 179.",
      }),
      label: z.string().default("CMS Form 179"),
    }),
    spaPages: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("SPA Pages"),
    }),
    coverLetter: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Cover Letter"),
    }),
    tribalEngagement: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Tribal Engagement"),
    }),
    existingStatePlanPages: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Existing State Plan Pages"),
    }),
    publicNotice: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Public Notice"),
    }),
    sfq: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("SFQ"),
    }),
    tribalConsultation: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Tribal Consultation"),
    }),
    other: z.object({
      files: attachmentArraySchemaOptional(),
      label: z.string().default("Other"),
    }),
  }),
  authority: z.string().default("Medicaid SPA"),
  proposedEffectiveDate: z.number(),
  id: z
    .string()
    .min(1, { message: "Required" })
    .refine((id) => /^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/.test(id), {
      message: "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX",
    }),
});

export type FeSchema = z.infer<typeof feSchema>;

export const schema = feSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});

export const transform = async (event: APIGatewayEvent) => {
  const parsedResult = feSchema.safeParse(JSON.parse(event.body));
  if (!parsedResult.success) {
    throw parsedResult.error;
  }

  // This is the backend check for auth
  if (!(await isAuthorized(event, parsedResult.data.id.slice(0, 2)))) {
    throw "Unauthorized";
  }

  // This is the backend check for the item already existing
  if (await itemExists({ id: parsedResult.data.id })) {
    throw "Item Already Exists";
  }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(
    authDetails.userId,
    authDetails.poolId,
  );
  const submitterEmail = userAttr.email;
  const submitterName = `${userAttr.given_name} ${userAttr.family_name}`;

  const transformedData = schema.parse({
    ...parsedResult.data,
    submitterName,
    submitterEmail,
    timestamp: Date.now(),
  });

  return transformedData;
};

export type Schema = Awaited<ReturnType<typeof transform>>;
