import { z } from "zod";

export const state_plan_service_subtypesSchema = z.object({
  ID_Number: z.string(),
  Service_SubType_ID: z.number()
});
export type state_plan_service_subtypes = z.infer<typeof state_plan_service_subtypesSchema>;
