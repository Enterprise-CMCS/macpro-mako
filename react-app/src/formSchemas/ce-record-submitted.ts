import { events } from "shared-types/events";

import { itemExists } from "@/api";
import { isAuthorizedState } from "@/utils";

import {
  applyCeFormRefinement,
  ceFormAttachmentsSchema,
  DUPLICATE_SUBMISSION_ID_MESSAGE,
  UNAUTHORIZED_STATE_MESSAGE,
} from "./ce-attachments";

const recordBase = events["ce-record-submitted"].baseSchema;
const refineCeSubmission = events["ce-record-submitted"].refineCeSubmission;

export const formSchema = recordBase
  .extend({
    id: recordBase.shape.id
      .refine(isAuthorizedState, {
        message: UNAUTHORIZED_STATE_MESSAGE,
      })
      .refine(async (value) => !(await itemExists(value, { includeDrafts: true })), {
        message: DUPLICATE_SUBMISSION_ID_MESSAGE,
      }),
    state: recordBase.shape.state.refine(isAuthorizedState, {
      message: UNAUTHORIZED_STATE_MESSAGE,
    }),
    attachments: ceFormAttachmentsSchema,
  })
  .superRefine((value, ctx) => {
    applyCeFormRefinement(value, ctx, refineCeSubmission);
  });
