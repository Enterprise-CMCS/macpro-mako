import { z } from "zod";

export const getAdditionalInformation = <
  Schema extends z.ZodObject<any, any, any> | z.ZodEffects<any>,
>(
  schema: Schema,
) => {
  if (schema instanceof z.ZodEffects) {
    const innerSchema = schema._def.schema;

    if (innerSchema instanceof z.ZodObject) {
      // for some reason if the schema has an optional on additional information
      // it changes the way that you get the shape of the schema
      if (
        innerSchema._def.shape().additionalInformation instanceof
          z.ZodDefault ||
        innerSchema._def.shape().additionalInformation instanceof z.ZodString ||
        innerSchema._def.shape().additionalInformation instanceof z.ZodOptional
      ) {
        return innerSchema._def.shape().additionalInformation;
      }
    }
  }

  if (schema instanceof z.ZodObject) {
    if (
      schema._def.shape().additionalInformation instanceof z.ZodOptional ||
      schema._def.shape().additionalInformation instanceof z.ZodDefault ||
      schema._def.shape().additionalInformation instanceof z.ZodString ||
      schema._def.shape().additionalInformation instanceof z.ZodEffects
    ) {
      return schema._def.shape().additionalInformation;
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