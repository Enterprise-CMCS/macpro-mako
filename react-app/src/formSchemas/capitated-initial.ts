import { events } from "shared-types/events";
import { isAuthorizedState } from "@/utils";
import { itemExists } from "@/api";

export const formSchema = events["capitated-initial"].baseSchema.extend({
  id: events["capitated-initial"].baseSchema.shape.id
    .refine(isAuthorizedState, {
      message:
        "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    })
    .refine(async (value) => !(await itemExists(value)), {
      message:
        "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
    }),
});

// export type Schema = Awaited<ReturnType<typeof transform>>;
