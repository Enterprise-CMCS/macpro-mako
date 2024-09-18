import { events } from "shared-types/events";
import { isAuthorizedState } from "@/utils";
import { getItem, idIsApproved, itemExists } from "@/api";
import { z } from "zod";

const baseSchema = events["temporary-extension"].baseSchema;
type TranformShapeToSatisfy = z.infer<typeof baseSchema>;

export const testFormSchema = baseSchema
  .omit({
    id: true,
    waiverNumber: true,
  })
  .extend({
    ids: z.object({
      id: events["temporary-extension"].baseSchema.shape.id,
      waiverNumber: events["temporary-extension"].baseSchema.shape.waiverNumber,
    }), //.refines here
  })
  .transform((data) => {
    const { ids, ...restOfForm } = data;
    return {
      ...restOfForm,
      ...ids,
    } satisfies TranformShapeToSatisfy;
  });

export const formSchema = events["temporary-extension"].baseSchema
  .extend({
    id: events["temporary-extension"].baseSchema.shape.id
      .refine(isAuthorizedState, {
        message:
          "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
      })
      .refine(async (value) => !(await itemExists(value)), {
        message:
          "According to our records, this Temporary Extension Request Number already exists. Please check the Temporary Extension Request Number and try entering it again.",
      }),
    waiverNumber: events["temporary-extension"].baseSchema.shape.waiverNumber
      .refine(async (value) => await itemExists(value), {
        message:
          "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
      })
      .refine(async (value) => idIsApproved(value), {
        message:
          "According to our records, this Approved Initial or Renewal Waiver Number is not approved. You must supply an approved Initial or Renewal Waiver Number.",
      }),
  })
  .superRefine(async (data, ctx) => {
    // Check that the authorities match
    try {
      const originalWaiverData = await getItem(data.waiverNumber);
      if (originalWaiverData._source.authority !== data.authority) {
        ctx.addIssue({
          message:
            "The selected Temporary Extension Type does not match the Approved Initial or Renewal Waiver's type.",
          code: z.ZodIssueCode.custom,
          fatal: true,
          path: ["authority"],
        });
      }

      // Check that the original waiver and temp extension have the same id up to the last period
      const waiverNumberPrefix = data.waiverNumber.substring(
        0,
        data.waiverNumber.lastIndexOf("."),
      );
      const idPrefix = data.id.substring(0, data.id.lastIndexOf("."));
      if (waiverNumberPrefix !== idPrefix) {
        ctx.addIssue({
          message:
            "The Approved Initial or Renewal Waiver Number and the Temporary Extension Request Number must be identical until the last period.",
          code: z.ZodIssueCode.custom,
          fatal: true,
          path: ["id"],
        });
      }
      return z.never;
    } catch (error) {
      // If we've failed here, the item does not exist, and the originalWaiverNumberSchema validation will throw the correct errors.
      console.error(error);
      return z.never;
    }
  });

// export type Schema = Awaited<ReturnType<typeof transform>>;
