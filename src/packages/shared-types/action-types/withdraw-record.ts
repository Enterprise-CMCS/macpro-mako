import { z } from "zod";
import { Action } from "../actions";

export const withdrawRecordSchema = z.object({
  actionType: z.nativeEnum(Action),
});
