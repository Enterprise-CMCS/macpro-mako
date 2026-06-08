import { events } from "shared-types/events";
import { z } from "zod";

import { canBeRenewedOrAmended, idIsApproved, itemExists } from "@/api";
import {
  unauthorizedStateMessage,
  validateRelatedWaiverId,
} from "@/formSchemas/waiver-state-validation";
import { isAuthorizedState } from "@/utils";

export const formSchema = events["contracting-amendment"].baseSchema
  .extend({
    id: events["contracting-amendment"].baseSchema.shape.id
      .refine(async (value) => await isAuthorizedState(value), {
        message: unauthorizedStateMessage,
      })
      .refine(async (value) => !(await itemExists(value, { includeDrafts: true })), {
        message:
          "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
      }),
    waiverNumber: events["contracting-amendment"].baseSchema.shape.waiverNumber.superRefine(
      async (value, ctx) => {
        if (!(await isAuthorizedState(value))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: unauthorizedStateMessage,
          });
          return;
        }

        if (!(await itemExists(value))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
          });
          return;
        }

        if (!(await canBeRenewedOrAmended(value))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
          });
          return;
        }

        if (!(await idIsApproved(value))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
          });
        }
      },
    ),
  })
  .superRefine(async ({ id, waiverNumber }, ctx) => {
    await validateRelatedWaiverId({
      ctx,
      sourceId: waiverNumber,
      sourceLabel: "Existing Waiver Number to Amend",
      targetId: id,
      targetLabel: "The 1915(b) Waiver Amendment Number",
      targetPath: ["id"],
    });
  });
