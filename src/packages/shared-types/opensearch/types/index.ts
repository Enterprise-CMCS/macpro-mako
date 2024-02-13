import { z } from "zod";
import { Response, Hit } from "./../_";

// from index 'subtypes'
export const recordSubTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  typeId: z.number(),
  authorityId: z.number(),
});
export type RecordSubType = z.infer<typeof recordSubTypeSchema>;

export type RecordSubTypeList = Response<RecordSubType>;
export type RecordSubTypeItemResult = Hit<RecordSubType> & {
  found: boolean;
};

// from index 'types'
export const recordTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  authorityId: z.number(),
});
export type RecordType = z.infer<typeof recordTypeSchema>;

export type RecordTypeList = Response<RecordType>;
export type RecordTypeItemResult = Hit<RecordType> & {
  found: boolean;
};
