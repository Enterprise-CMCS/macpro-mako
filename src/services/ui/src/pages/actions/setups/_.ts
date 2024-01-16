import { ZodObject } from "zod";
import { AttachmentRecipe } from "@/lib";

export type FormSetup = {
  schema: ZodObject<any>;
  attachments: AttachmentRecipe<any>[];
};
