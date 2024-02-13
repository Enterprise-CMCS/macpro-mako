import { z } from "zod";

export const state_plan_service_typesSchema = z.object({
  ID_Number: z.string(),
  Service_Type_ID: z.number()
});
export type state_plan_service_types = z.infer<typeof state_plan_service_typesSchema>;
