import { ErrorType, logError } from "libs/sink-lib";
import { z } from "zod";

const smartOnemacEventSchema = z
  .object({
    spaWaiverId: z.string(),
    id: z.string(),
    correlationId: z.string(),
    origin: z.literal("SMART"),
    authority: z.string(),
    status: z.string(),
    createdAt: z.string(),
    createdByUserId: z.string(),
    createdByName: z.string(),
    createdByEmail: z.string(),
  })
  .passthrough();

export type SmartOnemacEvent = z.infer<typeof smartOnemacEventSchema>;

export const parseSmartOnemacEvent = (payload: unknown): SmartOnemacEvent | undefined => {
  const result = smartOnemacEventSchema.safeParse(payload);

  if (!result.success) {
    logError({
      type: ErrorType.VALIDATION,
      error: result.error,
      metadata: { payload },
    });
    return undefined;
  }

  return result.data;
};
