import { z } from "zod";
import {
  attachmentArraySchema,
  attachmentArraySchemaOptional,
} from "../attachments";
import { APIGatewayEvent } from "aws-lambda";

// These are fields we expect the frontend to provide in the api request's payload
const baseSchema = z.object({
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

export const feSchema = baseSchema.extend({
  id: baseSchema.shape.id
    .refine(
      async (value) => {
        if (__IS_FRONTEND__) {
          const { isAuthorizedState } = await import(
            "../../../../react-app/src/utils"
          );
          return isAuthorizedState(value);
        }
        return z.OK;
      },
      {
        message:
          "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
      },
    )
    .refine(
      async (value) => {
        if (__IS_FRONTEND__) {
          const { itemExists } = await import("../../../../react-app/src/api");
          return !(await itemExists(value));
        }
        return z.OK;
      },
      {
        message:
          "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
      },
    ),
});

export type FeSchema = z.infer<typeof feSchema>;

export const schema = baseSchema.extend({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string().email(),
  timestamp: z.number(),
});

export const transform = async (event: APIGatewayEvent) => {
  if (!__IS_FRONTEND__) {
    // Import backend-specific libraries conditionally
    const { isAuthorized, getAuthDetails, lookupUserAttributes } = await import(
      "../../../libs/api/auth/user"
    );
    const { itemExists } = await import("libs/api/package");
    const parsedResult = await feSchema.safeParseAsync(JSON.parse(event.body));
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

    const transformedData = await schema.parseAsync({
      ...parsedResult.data,
      submitterName,
      submitterEmail,
      timestamp: Date.now(),
    });

    return transformedData;
  }
  return {};
};

export type Schema = Awaited<ReturnType<typeof transform>>;
