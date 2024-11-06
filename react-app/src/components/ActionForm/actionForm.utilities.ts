import { z } from "zod";

export const getAttachments = <Schema extends z.ZodTypeAny>(
  schema: Schema,
): [string, z.ZodObject<z.ZodRawShape, "strip">][] => {
  if (schema instanceof z.ZodEffects) {
    const innerSchema = schema._def.schema;

    if (
      innerSchema instanceof z.ZodObject &&
      innerSchema.shape.attachments instanceof z.ZodObject
    ) {
      return Object.entries(innerSchema.shape?.attachments?.shape ?? {});
    }
  }

  if (schema instanceof z.ZodObject) {
    if (schema.shape.attachments instanceof z.ZodObject) {
      return Object.entries(schema.shape?.attachments?.shape ?? {});
    }
  }

  return [];
};
