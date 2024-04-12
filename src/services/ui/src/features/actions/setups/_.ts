import { ZodEffects, ZodObject } from "zod";
import { AttachmentRecipe } from "@/utils";

export type OldFormSetup = {
  schema: ZodObject<any> | ZodEffects<any>;
  attachments: AttachmentRecipe<any>[];
};
