import { events } from "shared-types/events";
import {
  approvedInitialOrRenewalWaiverIdFormatMessage,
  approvedInitialOrRenewalWaiverIdRegex,
  temporaryExtensionIdRegex,
  type TemporaryExtensionSchema,
} from "shared-types/events/temporary-extension";
import { z } from "zod";

import { getItem, idIsApproved, itemExists } from "@/api";
import { isAuthorizedState } from "@/utils";

const isTemporaryExtensionIdFormat = (value: string) => temporaryExtensionIdRegex.test(value);
const isApprovedInitialOrRenewalWaiverIdFormat = (value: string) =>
  approvedInitialOrRenewalWaiverIdRegex.test(value);
const getStatePrefixFromId = (value: string) => value.trim().toUpperCase().slice(0, 2);
const getTemporaryExtensionStateMismatchMessage = (waiverNumber: string) =>
  `The Temporary Extension Request Number must start with ${getStatePrefixFromId(
    waiverNumber,
  )} to match the Approved Initial or Renewal Waiver Number.`;
const unauthorizedTemporaryExtensionStateMessage =
  "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.";
const duplicateTemporaryExtensionIdMessage =
  "According to our records, this Temporary Extension Request Number already exists. Please check the Temporary Extension Request Number and try entering it again.";

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
            waiverNumber: events["temporary-extension"].baseSchema.shape.waiverNumber
              .refine(isApprovedInitialOrRenewalWaiverIdFormat, {
                message: approvedInitialOrRenewalWaiverIdFormatMessage,
              })
              .refine(
                async (value) =>
                  !isApprovedInitialOrRenewalWaiverIdFormat(value) || (await itemExists(value)),
                {
                  message:
                    "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
                },
              )
              .refine(
                async (value) =>
                  !isApprovedInitialOrRenewalWaiverIdFormat(value) || idIsApproved(value),
                {
                  message:
                    "According to our records, this Approved Initial or Renewal Waiver Number is not approved. You must supply an approved Initial or Renewal Waiver Number.",
                },
              ),
            authority: events["temporary-extension"].baseSchema.shape.authority,
          })
          .refine(
            async (data) => {
              if (
                !data.waiverNumber?.trim() ||
                !data.authority?.trim() ||
                !isApprovedInitialOrRenewalWaiverIdFormat(data.waiverNumber)
              ) {
                return true;
              }

              try {
                const originalWaiverData = await getItem(data.waiverNumber);

                return originalWaiverData?._source?.authority === data.authority;
              } catch {
                return true;
              }
            },
            {
              message:
                "The selected Temporary Extension Type does not match the Approved Initial or Renewal Waiver's type.",
              path: ["authority"],
            },
          ),
        id: events["temporary-extension"].baseSchema.shape.id,
      })
      .superRefine(async ({ id, validAuthority }, ctx) => {
        if (!isTemporaryExtensionIdFormat(id)) {
          return;
        }

        const waiverNumber = validAuthority.waiverNumber;
        if (isApprovedInitialOrRenewalWaiverIdFormat(waiverNumber)) {
          const waiverStatePrefix = getStatePrefixFromId(waiverNumber);
          const temporaryExtensionStatePrefix = getStatePrefixFromId(id);

          if (temporaryExtensionStatePrefix !== waiverStatePrefix) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: getTemporaryExtensionStateMismatchMessage(waiverNumber),
              path: ["id"],
            });
            return;
          }
        }

        if (!(await isAuthorizedState(id))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: unauthorizedTemporaryExtensionStateMessage,
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
