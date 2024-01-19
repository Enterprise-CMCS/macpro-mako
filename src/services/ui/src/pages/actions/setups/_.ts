import { ZodEffects, ZodObject } from "zod";
import { AttachmentRecipe } from "@/lib";

export type FormSetup = {
  schema: ZodObject<any> | ZodEffects<any>;
  attachments: AttachmentRecipe<any>[];
};
