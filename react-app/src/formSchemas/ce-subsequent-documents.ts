import { events } from "shared-types/events";

import { isAuthorizedState } from "@/utils";

import {
  applyCeFormRefinement,
  ceFormAttachmentsSchema,
  UNAUTHORIZED_STATE_MESSAGE,
} from "./ce-attachments";

const subsequentBase = events["ce-subsequent-documents"].baseSchema;
const refineCeSubmission = events["ce-subsequent-documents"].refineCeSubmission;

export const formSchema = subsequentBase
  .extend({
    id: subsequentBase.shape.id.refine(isAuthorizedState, {
      message: UNAUTHORIZED_STATE_MESSAGE,
    }),
    state: subsequentBase.shape.state.refine(isAuthorizedState, {
      message: UNAUTHORIZED_STATE_MESSAGE,
    }),
    attachments: ceFormAttachmentsSchema,
  })
  .superRefine((value, ctx) => {
    applyCeFormRefinement(value, ctx, refineCeSubmission);
  });
