import { z } from "zod";
import { isAuthorizedState } from "@/utils";
import { canBeRenewedOrAmended, idIsApproved, itemExists } from "@/api";

export const zSpaIdSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/,
    "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX",
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  .refine(async (value) => !(await itemExists(value)), {
    message:
      "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
  });

export const zAttachmentOptional = z.array(z.instanceof(File)).optional();

export const zAttachmentRequired = ({
  min,
  max = 9999,
  message = "Required",
}: {
  min: number;
  max?: number;
  message?: string;
}) =>
  z
    .array(z.instanceof(File))
    .refine((value) => value.length >= min && value.length <= max, {
      message: message,
    });

export const zAdditionalInfo = z
  .string()
  .max(4000, "This field may only be up to 4000 characters.");

export const zInitialWaiverNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{4,5}\.R00\.00$/,
    "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00",
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  .refine(async (value) => !(await itemExists(value)), {
    message:
      "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
  });

export const zRenewalWaiverNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{4,5}\.R(?!00)\d{2}\.\d{2}$/,
    "Renewal Number must be in the format of SS-####.R##.00 or SS-#####.R##.00 For renewals, the “R##” starts with '01' and ascends.",
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  .refine(async (value) => !(await itemExists(value)), {
    message:
      "According to our records, this 1915(b) Waiver Renewal Number already exists. Please check the 1915(b) Waiver Renewal Number and try entering it again.",
  });

export const zAmendmentWaiverNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{4,5}\.R\d{2}\.(?!00)\d{2}$/,
    "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For amendments, the last two digits start with '01' and ascends.",
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  .refine(async (value) => !(await itemExists(value)), {
    message:
      "According to our records, this 1915(b) Waiver Amendment Number already exists. Please check the 1915(b) Waiver Amendment Number and try entering it again.",
  });

export const zAmendmentOriginalWaiverNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{4,5}\.R\d{2}\.\d{2}$/,
    "The approved 1915(b) Initial or Renewal Number must be in the format of SS-####.R##.## or SS-#####.R##.##.",
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  // This should already exist.
  .refine(async (value) => await itemExists(value), {
    message:
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
  })
  .refine(async (value) => canBeRenewedOrAmended(value), {
    message:
      "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
  })
  .refine(async (value) => idIsApproved(value), {
    message:
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
  });
export const zRenewalOriginalWaiverNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{4,5}\.R\d{2}\.\d{2}$/,
    "The approved 1915(b) Initial or Renewal Waiver Number must be in the format of SS-####.R##.## or SS-#####.R##.##.",
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  // This should already exist
  .refine(async (value) => await itemExists(value), {
    message:
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
  })
  .refine(async (value) => canBeRenewedOrAmended(value), {
    message:
      "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
  })
  .refine(async (value) => idIsApproved(value), {
    message:
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
  });

export const zAppkWaiverNumberSchema = z
  .string()
  .regex(
    /^\d{4,5}\.R\d{2}\.\d{2}$/,
    "The 1915(c) Waiver Amendment Number must be in the format of ####.R##.## or #####.R##.##. For amendments, the last two digits start with '01' and ascends.",
  )
  .default("");

export const zExtensionWaiverNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{4,5}\.R\d{2}\.TE\d{2}$/,
    "The Temporary Extension Request Number must be in the format of SS-####.R##.TE## or SS-#####.R##.TE##",
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  .refine(async (value) => !(await itemExists(value)), {
    message:
      "According to our records, this Temporary Extension Request Number already exists. Please check the Temporary Extension Request Number and try entering it again.",
  });

export const zExtensionOriginalWaiverNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}-\d{4,5}\.R\d{2}\.00$/,
    "The Approved Initial or Renewal Waiver Number must be in the format of SS-####.R##.00 or SS-#####.R##.00.",
  )
  .refine((value) => isAuthorizedState(value), {
    message:
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
  })
  // This should already exist
  .refine(async (value) => itemExists(value), {
    message:
      "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
  })
  .refine(async (value) => idIsApproved(value), {
    message:
      "According to our records, this Approved Initial or Renewal Waiver Number is not approved. You must supply an approved Initial or Renewal Waiver Number.",
  });

export const zUpdateIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9.-]*$/, {
    message:
      "The new ID can only contain letters, numbers, dots, and dashes without any whitespace.",
  })
  .refine(async (value) => !(await itemExists(value)), {
    message:
      "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
  });
