import { describe, expect, it } from "vitest";

import { emailLookupSecretArn } from "./email-lookup-secret";

describe("emailLookupSecretArn", () => {
  it("scopes the secret ARN to the named lookup secret", () => {
    expect(emailLookupSecretArn("us-east-1", "123456789012", "emailAddresses")).toBe(
      "arn:aws:secretsmanager:us-east-1:123456789012:secret:emailAddresses-*",
    );
  });

  it("does not use a secret:* wildcard", () => {
    const arn = emailLookupSecretArn("us-east-1", "123456789012", "emailAddresses");
    expect(arn).not.toContain("secret:*");
  });
});
