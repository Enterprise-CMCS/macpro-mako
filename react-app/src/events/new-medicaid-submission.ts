import { newMedicaidSubmission } from "shared-types/events";
import { isAuthorizedState } from "@/utils";
import { itemExists } from "@/api";
export const formSchema = newMedicaidSubmission.baseSchema.extend({
  id: newMedicaidSubmission.baseSchema.shape.id
    .refine(isAuthorizedState, {
      message:
        "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    })
    .refine(async (value) => !(await itemExists(value)), {
      message:
        "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
    }),
});

// export type Schema = Awaited<ReturnType<typeof transform>>;
