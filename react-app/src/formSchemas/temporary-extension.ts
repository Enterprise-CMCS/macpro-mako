import { events } from "shared-types/events";
import {
  temporaryExtensionIdRegex,
  type TemporaryExtensionSchema,
} from "shared-types/events/temporary-extension";
import { z } from "zod";

import { getItem, idIsApproved, itemExists } from "@/api";
import {
  getRelatedWaiverIdStatePrefixMismatchMessage,
  unauthorizedStateMessage,
} from "@/formSchemas/waiver-state-validation";
import { isAuthorizedState } from "@/utils";

const duplicateTemporaryExtensionIdMessage =
  "According to our records, this Temporary Extension Request Number already exists. Please check the Temporary Extension Request Number and try entering it again.";

export const temporaryExtensionAuthorityMismatchMessage =
  "The selected Temporary Extension Type does not match the Approved Initial or Renewal Waiver's type.";

export const getTemporaryExtensionAuthorityMismatchMessage = async ({
  authority,
  waiverNumber,
}: {
  authority?: string;
  waiverNumber?: string;
}) => {
  if (!waiverNumber?.trim() || !authority?.trim()) {
    return undefined;
  }

  try {
    const originalWaiverData = await getItem(waiverNumber);
    const originalAuthority = originalWaiverData?._source?.authority;

    if (typeof originalAuthority !== "string" || !originalAuthority.trim()) {
      return undefined;
    }

    return originalAuthority.trim() === authority.trim()
      ? undefined
      : temporaryExtensionAuthorityMismatchMessage;
  } catch {
    return undefined;
  }
};

export const formSchema = events["temporary-extension"].baseSchema
  .omit({
    id: true,
    waiverNumber: true,
    authority: true,
  })
  .extend({
    ids: z
      .object({
        validAuthority: z
          .object({
            waiverNumber: events["temporary-extension"].baseSchema.shape.waiverNumber.superRefine(
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
                      "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
                  });
                  return;
                }

                if (!(await idIsApproved(value))) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                      "According to our records, this Approved Initial or Renewal Waiver Number is not approved. You must supply an approved Initial or Renewal Waiver Number.",
                  });
                }
              },
            ),
            authority: events["temporary-extension"].baseSchema.shape.authority,
          })
          .refine(async (data) => !(await getTemporaryExtensionAuthorityMismatchMessage(data)), {
            message: temporaryExtensionAuthorityMismatchMessage,
            path: ["authority"],
          }),
        id: events["temporary-extension"].baseSchema.shape.id,
      })
      .superRefine(async ({ id, validAuthority }, ctx) => {
        const statePrefixMismatchMessage = await getRelatedWaiverIdStatePrefixMismatchMessage({
          sourceId: validAuthority.waiverNumber,
          sourceLabel: "Approved Initial or Renewal Waiver Number",
          targetId: id,
          targetLabel: "The Temporary Extension Request Number",
        });

        if (statePrefixMismatchMessage) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: statePrefixMismatchMessage,
            path: ["id"],
          });
          return;
        }

        if (!temporaryExtensionIdRegex.test(id)) {
          return;
        }

        if (!(await isAuthorizedState(id))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: unauthorizedStateMessage,
            path: ["id"],
          });
          return;
        }

        if (await itemExists(id, { includeDrafts: true })) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: duplicateTemporaryExtensionIdMessage,
            path: ["id"],
          });
        }
      }),
  })
  .transform((data) => {
    const {
      ids: { id, validAuthority },
      ...restOfForm
    } = data;
    return {
      ...restOfForm,
      ...validAuthority,
      id,
    } satisfies TemporaryExtensionSchema;
  });
