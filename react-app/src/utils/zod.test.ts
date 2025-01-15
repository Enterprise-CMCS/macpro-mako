import {
  EXISTING_ITEM_APPROVED_AMEND_ID,
  EXISTING_ITEM_APPROVED_NEW_ID,
  EXISTING_ITEM_APPROVED_RENEW_ID,
  EXISTING_ITEM_ID,
  EXISTING_ITEM_PENDING_ID,
  EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
  NOT_FOUND_ITEM_ID,
  TEST_ITEM_ID,
} from "mocks";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  zAdditionalInfo,
  zAdditionalInfoOptional,
  zAmendmentOriginalWaiverNumberSchema,
  zAmendmentWaiverNumberSchema,
  zAppkWaiverNumberSchema,
  zAttachmentOptional,
  zAttachmentRequired,
  zExtensionOriginalWaiverNumberSchema,
  zExtensionWaiverNumberSchema,
  zInitialWaiverNumberSchema,
  zRenewalOriginalWaiverNumberSchema,
  zRenewalWaiverNumberSchema,
  zSpaIdSchema,
  zUpdateIdSchema,
  zodAlwaysRefine,
} from "./zod";

afterEach(() => {
  vi.clearAllMocks();
});

describe("zSpaIdSchema", () => {
  it("validates a correct ID format", async () => {
    const result = await zSpaIdSchema.safeParseAsync("MD-21-1234");
    expect(result.success).toBe(true);
  });

  it("validates a corrected ID format with a suffix", async () => {
    const result = await zSpaIdSchema.safeParseAsync("MD-21-1234-ABCD");
    expect(result.success).toBe(true);
  });

  it("fails when the ID is empty", async () => {
    const result = await zSpaIdSchema.safeParseAsync("");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Required");
  });

  it("fails when state is unauthorized", async () => {
    const result = await zSpaIdSchema.safeParseAsync("AK-21-1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("fails when ID already exists", async () => {
    const result = await zSpaIdSchema.safeParseAsync(EXISTING_ITEM_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
    );
  });
});

describe("zAttachmentOptional", () => {
  it("validates an empty array", async () => {
    const result = await zAttachmentOptional.safeParseAsync([]);
    expect(result.success).toBe(true);
  });

  it("validates an array of files", async () => {
    const result = await zAttachmentOptional.safeParseAsync([new File(["content"], "file.txt")]);
    expect(result.success).toBe(true);
  });

  it("passes when no files are provided", () => {
    const result = zAttachmentOptional.safeParse(undefined);
    expect(result.success).toBe(true);
  });
});

describe("zAttachmentRequired", () => {
  const schema = zAttachmentRequired({ min: 1, max: 3 });

  it("validates an array within file count bounds", () => {
    const files = [new File(["content"], "file1.txt"), new File(["content"], "file2.txt")];
    const result = schema.safeParse(files);
    expect(result.success).toBe(true);
  });

  it("fails if file count is below minimum", () => {
    const result = schema.safeParse([]);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Required");
  });

  it("fails if file count is above maximum", () => {
    const files = [
      new File(["content"], "file1.txt"),
      new File(["content"], "file2.txt"),
      new File(["content"], "file3.txt"),
      new File(["content"], "file4.txt"),
    ];
    const result = schema.safeParse(files);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Required");
  });
});

describe("zAdditionalInfoOptional", () => {
  it("allows valid strings within length limit", () => {
    const result = zAdditionalInfoOptional.safeParse("This is a valid string");
    expect(result.success).toBe(true);
  });

  it("allows empty strings", () => {
    const result = zAdditionalInfoOptional.safeParse("");
    expect(result.success).toBe(true);
  });

  it("fails if string is only whitespace", () => {
    const result = zAdditionalInfoOptional.safeParse("   ");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "Additional Information can not be only whitespace.",
    );
  });

  it("fails if string is too long", () => {
    const longString = "A".repeat(4001);
    const result = zAdditionalInfoOptional.safeParse(longString);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("This field may only be up to 4000 characters.");
  });

  it("fails if string is too long and only whitespace", () => {
    const longString = " ".repeat(4001);
    const result = zAdditionalInfoOptional.safeParse(longString);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("This field may only be up to 4000 characters.");
  });
});

describe("zAdditionalInfo", () => {
  it("validates a non-empty string", () => {
    const result = zAdditionalInfo.safeParse("This is a valid string");
    expect(result.success).toBe(true);
  });

  it("fails on empty string", () => {
    const result = zAdditionalInfo.safeParse("");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Additional Information is required.");
  });

  it("fails on whitespace string", () => {
    const result = zAdditionalInfo.safeParse("   ");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "Additional Information can not be only whitespace.",
    );
  });

  it("fails on string that is too long", () => {
    const longString = "A".repeat(4001);
    const result = zAdditionalInfo.safeParse(longString);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("This field may only be up to 4000 characters.");
  });

  it("validates a string exactly 4000 characters long", () => {
    const maxString = "A".repeat(4000);
    const result = zAdditionalInfo.safeParse(maxString);
    expect(result.success).toBe(true);
  });

  it("fails on string that is too long and only whitespace", () => {
    const longString = " ".repeat(4001);
    const result = zAdditionalInfo.safeParse(longString);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("This field may only be up to 4000 characters.");
  });

  it("fails on null value", () => {
    const result = zAdditionalInfo.safeParse(null);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Expected string, received null");
  });
});

describe("zInitialWaiverNumberSchema", () => {
  it("validates a correct waiver number", async () => {
    const result = await zInitialWaiverNumberSchema.safeParseAsync("MD-1234.R00.00");
    expect(result.success).toBe(true);
  });

  it("fails with unauthorized state", async () => {
    const result = await zInitialWaiverNumberSchema.safeParseAsync("AK-1234.R00.00");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("fails on empty string", async () => {
    const result = await zInitialWaiverNumberSchema.safeParseAsync("");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe("Required");
  });

  it("fails with an existing waiver number", async () => {
    const result = await zInitialWaiverNumberSchema.safeParseAsync(EXISTING_ITEM_APPROVED_NEW_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
    );
  });

  it("fails with an invalid waiver number format", async () => {
    const result = await zInitialWaiverNumberSchema.safeParseAsync("MD-1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00",
    );
  });
});

describe("zRenewalWaiverNumberSchema", () => {
  it("validates a correct renewal waiver number format", async () => {
    const result = await zRenewalWaiverNumberSchema.safeParseAsync("MD-12345.R01.00");
    expect(result.success).toBe(true);
  });

  it("fails with an invalid waiver number format", async () => {
    const result = await zRenewalWaiverNumberSchema.safeParseAsync("MD-1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "Renewal Number must be in the format of SS-####.R##.00 or SS-#####.R##.00 For renewals, the “R##” starts with '01' and ascends.",
    );
  });

  it("fails if user does not have access to the state", async () => {
    const result = await zRenewalWaiverNumberSchema.safeParseAsync("AK-12345.R01.00");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("fails if waiver number already exists", async () => {
    const result = await zRenewalWaiverNumberSchema.safeParseAsync(TEST_ITEM_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this 1915(b) Waiver Renewal Number already exists. Please check the 1915(b) Waiver Renewal Number and try entering it again.",
    );
  });
});

describe("zAmendmentWaiverNumberSchema", () => {
  it("validates a correct amendment waiver number format", async () => {
    const result = await zAmendmentWaiverNumberSchema.safeParseAsync("MD-12345.R01.01");
    expect(result.success).toBe(true);
  });

  it("fails if the user does not have access to the state", async () => {
    const result = await zAmendmentWaiverNumberSchema.safeParseAsync("AK-12345.R01.01");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("fails if the waiver number is not in the correct format", async () => {
    const result = await zAmendmentWaiverNumberSchema.safeParseAsync("MD-12345.R01.00");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The 1915(b) Waiver Amendment Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For amendments, the last two digits start with '01' and ascends.",
    );
  });

  it("fails if the waiver number exists", async () => {
    const result = await zAmendmentWaiverNumberSchema.safeParseAsync(
      EXISTING_ITEM_APPROVED_AMEND_ID,
    );
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this 1915(b) Waiver Amendment Number already exists. Please check the 1915(b) Waiver Amendment Number and try entering it again.",
    );
  });
});

describe("zAmendmentOriginalWaiverNumberSchema", () => {
  it("fails if the user does not have access to the state", async () => {
    const result = await zAmendmentOriginalWaiverNumberSchema.safeParseAsync("AK-12345.R01.01");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("validates a correct amendment original waiver number format", async () => {
    const result = await zAmendmentOriginalWaiverNumberSchema.safeParseAsync(
      EXISTING_ITEM_APPROVED_NEW_ID,
    );
    expect(result.success).toBe(true);
  });

  it("fails if the waiver number is not in the correct format", async () => {
    const result = await zAmendmentOriginalWaiverNumberSchema.safeParseAsync("MD-12345.R01.AA");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The approved 1915(b) Initial or Renewal Number must be in the format of SS-####.R##.## or SS-#####.R##.##.",
    );
  });

  it("fails if the waiver number does not yet exist", async () => {
    const result = await zAmendmentOriginalWaiverNumberSchema.safeParseAsync(NOT_FOUND_ITEM_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
    );
  });

  it("fails if the waiver number is not approved", async () => {
    const result =
      await zAmendmentOriginalWaiverNumberSchema.safeParseAsync(EXISTING_ITEM_PENDING_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
    );
  });
});

describe("zRenewalOriginalWaiverNumberSchema", () => {
  it("fails if the user does not have access to the state", async () => {
    const result = await zRenewalOriginalWaiverNumberSchema.safeParseAsync("AK-12345.R01.01");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("validates a correct renewal waiver number format", async () => {
    const result = await zRenewalOriginalWaiverNumberSchema.safeParseAsync(
      EXISTING_ITEM_APPROVED_RENEW_ID,
    );
    expect(result.success).toBe(true);
  });

  it("fails if the waiver number is not in the correct format", async () => {
    const result = await zRenewalOriginalWaiverNumberSchema.safeParseAsync("MD-12345.R01.AA");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The approved 1915(b) Initial or Renewal Waiver Number must be in the format of SS-####.R##.## or SS-#####.R##.##.",
    );
  });

  it("fails if the waiver number does not yet exist", async () => {
    const result = await zRenewalOriginalWaiverNumberSchema.safeParseAsync(NOT_FOUND_ITEM_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this 1915(b) Waiver Number does not yet exist. Please check the 1915(b) Initial or Renewal Waiver Number and try entering it again.",
    );
  });

  it("fails if the waiver number does not match records", async () => {
    const result = await zRenewalOriginalWaiverNumberSchema.safeParseAsync(
      EXISTING_ITEM_APPROVED_AMEND_ID,
    );
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The 1915(b) Waiver Number entered does not seem to match our records. Please enter an approved 1915(b) Initial or Renewal Waiver Number, using a dash after the two character state abbreviation.",
    );
  });

  it("fails if the waiver number is not approved", async () => {
    const result =
      await zRenewalOriginalWaiverNumberSchema.safeParseAsync(EXISTING_ITEM_PENDING_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this 1915(b) Waiver Number is not approved. You must supply an approved 1915(b) Initial or Renewal Waiver Number.",
    );
  });
});

describe("zAppkWaiverNumberSchema", () => {
  it("validates a correct waiver number format", async () => {
    const result = await zAppkWaiverNumberSchema.safeParseAsync("1234.R00.01");
    expect(result.success).toBe(true);
  });

  it("fails if the waiver amendment number is not in the correct format", async () => {
    const result = await zAppkWaiverNumberSchema.safeParseAsync("WRONG-FORMAT");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The Waiver Amendment Number must be in the format of ####.R##.## or #####.R##.##. For amendments, the last two digits start with '01' and ascends.",
    );
  });

  it("fails if the waiver amendment number ends in 00", async () => {
    const result = await zAppkWaiverNumberSchema.safeParseAsync("1234.R00.00");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The Waiver Amendment Number must be in the format of ####.R##.## or #####.R##.##. For amendments, the last two digits start with '01' and ascends.",
    );
  });
});

describe("zExtensionWaiverNumberSchema", () => {
  it("validates a correct waiver number format", async () => {
    const result = await zExtensionWaiverNumberSchema.safeParseAsync("MD-1234.R00.TE00");
    expect(result.success).toBe(true);
  });

  it("fails if the user does not have access to the state", async () => {
    const result = await zExtensionWaiverNumberSchema.safeParseAsync("AK-1234.R00.TE00");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("fails if the waiver number is not in the correct format", async () => {
    const result = await zExtensionWaiverNumberSchema.safeParseAsync("MD-1234.R00.TE");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The Temporary Extension Request Number must be in the format of SS-####.R##.TE## or SS-#####.R##.TE##",
    );
  });

  it("fails if the waiver number already exists", async () => {
    const result = await zExtensionWaiverNumberSchema.safeParseAsync(
      EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
    );
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this Temporary Extension Request Number already exists. Please check the Temporary Extension Request Number and try entering it again.",
    );
  });
});

describe("zExtensionOriginalWaiverNumberSchema", () => {
  it("validates a correct waiver number format", async () => {
    const result = await zExtensionOriginalWaiverNumberSchema.safeParseAsync(TEST_ITEM_ID);
    expect(result.success).toBe(true);
  });

  it("fails if the user does not have access to the state", async () => {
    const result = await zExtensionOriginalWaiverNumberSchema.safeParseAsync("AK-1234.R00.00");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.",
    );
  });

  it("fails if the waiver number is not in the correct format", async () => {
    const result = await zExtensionOriginalWaiverNumberSchema.safeParseAsync("MD-1234.R00.TE00");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The Approved Initial or Renewal Waiver Number must be in the format of SS-####.R##.00 or SS-#####.R##.00.",
    );
  });

  it("fails if the waiver number does not yet exist", async () => {
    const result = await zExtensionOriginalWaiverNumberSchema.safeParseAsync(NOT_FOUND_ITEM_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this Approved Initial or Renewal Waiver Number does not yet exist. Please check the Approved Initial or Renewal Waiver Number and try entering it again.",
    );
  });

  it("fails if the waiver number is not approved", async () => {
    const result =
      await zExtensionOriginalWaiverNumberSchema.safeParseAsync(EXISTING_ITEM_PENDING_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this Approved Initial or Renewal Waiver Number is not approved. You must supply an approved Initial or Renewal Waiver Number.",
    );
  });
});

describe("zUpdateIdSchema", () => {
  it("validates a correct ID format", async () => {
    const result = await zUpdateIdSchema.safeParseAsync("MD-21-1234");
    expect(result.success).toBe(true);
  });

  it("fails if the ID already exists", async () => {
    const result = await zUpdateIdSchema.safeParseAsync(EXISTING_ITEM_ID);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "According to our records, this ID already exists. Please check the ID and try entering it again.",
    );
  });

  it("fails if the ID contains whitespace", async () => {
    const result = await zUpdateIdSchema.safeParseAsync("wrong format");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The new ID can only contain uppercase letters, numbers, dots, and dashes without any whitespace, no leading or trailing dashes or dots, no consecutive dots or dashes.",
    );
  });

  it("fails if the ID contains leading dots", async () => {
    const result = await zUpdateIdSchema.safeParseAsync(".MD-21-1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The new ID can only contain uppercase letters, numbers, dots, and dashes without any whitespace, no leading or trailing dashes or dots, no consecutive dots or dashes.",
    );
  });

  it("fails if the ID contains trailing dots", async () => {
    const result = await zUpdateIdSchema.safeParseAsync("MD-21-1234.");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The new ID can only contain uppercase letters, numbers, dots, and dashes without any whitespace, no leading or trailing dashes or dots, no consecutive dots or dashes.",
    );
  });

  it("fails if the ID contains leading dashes", async () => {
    const result = await zUpdateIdSchema.safeParseAsync("-MD-21-1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The new ID can only contain uppercase letters, numbers, dots, and dashes without any whitespace, no leading or trailing dashes or dots, no consecutive dots or dashes.",
    );
  });

  it("fails if the ID contains trailing dashes", async () => {
    const result = await zUpdateIdSchema.safeParseAsync("MD-21-1234-");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The new ID can only contain uppercase letters, numbers, dots, and dashes without any whitespace, no leading or trailing dashes or dots, no consecutive dots or dashes.",
    );
  });

  it("fails if the ID contains consecutive dots", async () => {
    const result = await zUpdateIdSchema.safeParseAsync("MD-21..1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The new ID can only contain uppercase letters, numbers, dots, and dashes without any whitespace, no leading or trailing dashes or dots, no consecutive dots or dashes.",
    );
  });

  it("fails if the ID contains consecutive dashes", async () => {
    const result = await zUpdateIdSchema.safeParseAsync("MD-21--1234");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The new ID can only contain uppercase letters, numbers, dots, and dashes without any whitespace, no leading or trailing dashes or dots, no consecutive dots or dashes.",
    );
  });
});

describe("zodAlwaysRefine", () => {
  it("validates a correct value", async () => {
    const schema = zodAlwaysRefine(zExtensionWaiverNumberSchema);
    const result = await schema.safeParseAsync("MD-1234.R00.TE00");
    expect(result.success).toBe(true);
  });

  it("fails if the value is not correct", async () => {
    const schema = zodAlwaysRefine(zExtensionWaiverNumberSchema);
    const result = await schema.safeParseAsync("MD-1234.R00.TE");
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe(
      "The Temporary Extension Request Number must be in the format of SS-####.R##.TE## or SS-#####.R##.TE##",
    );
  });
});
