import { z } from "zod";
import { attachmentArraySchema } from "../attachments";
import { APIGatewayEvent } from "aws-lambda";
import {
  getAuthDetails,
  lookupUserAttributes,
} from "../../../libs/api/auth/user"; // this should move

// These are fields we expect the frontend to provide in the api request's payload
export const feSchema = z.object({
  action: z.literal("new-submission").default("new-submission"),
  additionalInformation: z.string().nullable().default(null),
  attachments: z.object({
    cmsForm179: z.object({
      files: attachmentArraySchema({
        min: 1,
        max: 1,
        message: "Required: You must submit exactly one file for CMS Form 179.",
      }),
      label: z.string().default("CMS Form 179"),
    }),
    spaPages: z.object({
      files: attachmentArraySchema({ min: 1 }),
      label: z.string().default("SPA Pages"),
    }),
    coverLetter: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Cover Letter"),
    }),
    tribalEngagement: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Tribal Engagement"),
    }),
    existingStatePlanPages: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Existing State Plan Pages"),
    }),
    publicNotice: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Public Notice"),
    }),
    sfq: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("SFQ"),
    }),
    tribalConsultation: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Tribal Consultation"),
    }),
    other: z.object({
      files: attachmentArraySchema(),
      label: z.string().default("Other"),
    }),
  }),
  authority: z.string().default("Medicaid SPA"),
  id: z.string(),
  proposedEffectiveDate: z.number(),
});

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

export type NewSubmission = Awaited<ReturnType<typeof transform>>;
