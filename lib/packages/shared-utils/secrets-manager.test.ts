import {
  TEST_SECRET_ERROR_ID,
  TEST_SECRET_ID,
  TEST_SECRET_NO_VALUE_ID,
  TEST_SECRET_TO_DELETE_ID,
} from "mocks";
import secrets from "mocks/data/secrets";
import { describe, expect, it } from "vitest";
import { getSecret } from ".";

describe("getSecret", () => {
  it("should return the secret value if the secret exists and is not marked for deletion", async () => {
    const result = await getSecret(TEST_SECRET_ID);
    expect(result).toBe(secrets[TEST_SECRET_ID].SecretString);
  });

  it("should throw an error if the secret is marked for deletion", async () => {
    await expect(getSecret(TEST_SECRET_TO_DELETE_ID)).rejects.toThrow(
      `Secret ${TEST_SECRET_TO_DELETE_ID} is marked for deletion and will not be used.`,
    );
  });

  it("should throw an error if the secret has no SecretString field", async () => {
    await expect(getSecret(TEST_SECRET_NO_VALUE_ID)).rejects.toThrow(
      `Secret ${TEST_SECRET_NO_VALUE_ID} has no SecretString field present in response`,
    );
  });

  it("should throw an error if there is an issue with the AWS SDK call", async () => {
    await expect(getSecret(TEST_SECRET_ERROR_ID)).rejects.toThrow(
      `Failed to fetch secret ${TEST_SECRET_ERROR_ID}: Secret Throw Get Secret Error has no SecretString field present in response`,
    );
  });
});
