import { z } from "zod";

export const getAdditionalInformation = <
  Schema extends z.ZodObject<any, any, any> | z.ZodEffects<any>,
>(
  schema: Schema,
) => {
  if (schema instanceof z.ZodEffects) {
    const innerSchema = schema._def.schema;

    if (innerSchema instanceof z.ZodObject) {
      if (
        innerSchema._def.shape().additionalInformation instanceof z.ZodOptional
      ) {
        return innerSchema._def.shape().additionalInformation;
      }
      if (innerSchema.shape.additionalInformation instanceof z.ZodDefault) {
        return innerSchema.shape.additionalInformation;
      }
    }
  }

  if (schema instanceof z.ZodObject) {
    if (
      schema.shape.additionalInformation instanceof z.ZodDefault ||
      schema.shape.additionalInformation instanceof z.ZodEffects
    ) {
      return schema.shape.additionalInformation;
    }
  }

  return undefined;
};

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
