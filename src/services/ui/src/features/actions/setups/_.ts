import { ZodEffects, ZodObject } from "zod";
import { AttachmentRecipe } from "@/utils";

export type FormSetup = {
  schema: ZodObject<any> | ZodEffects<any>;
  attachments: AttachmentRecipe<any>[];
};
