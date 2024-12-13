import { TestSecretData } from "../index.d";

export const TEST_SECRET_ID = "test-secret";
export const TEST_SECRET_TO_DELETE_ID = "test-secret-to-delete";
export const TEST_SECRET_NO_VALUE_ID = "test-secret-no-value";
export const TEST_SECRET_ERROR_ID = "Throw Get Secret Error";

const secrets: Record<string, TestSecretData> = {
  [TEST_SECRET_ID]: {
    ARN: `arn://${TEST_SECRET_ID}`,
    CreatedDate: new Date("2023-01-01T12:00:00Z").getTime(),
    Name: TEST_SECRET_ID,
    SecretString: "test-secret-value", // pragma: allowlist secret (not actual secret)
    VersionId: "1.0",
    VersionStages: ["prod"],
  },
  [TEST_SECRET_TO_DELETE_ID]: {
    ARN: `arn://${TEST_SECRET_TO_DELETE_ID}`,
    CreatedDate: new Date("2022-01-01T12:00:00Z").getTime(),
    DeletedDate: new Date("2022-12-31T23:59:59Z").getTime(),
    Name: TEST_SECRET_TO_DELETE_ID,
    SecretString: "deleted-test-secret-value", // pragma: allowlist secret (not actual secret)
    VersionId: "1.0",
    VersionStages: ["prod"],
  },
  [TEST_SECRET_NO_VALUE_ID]: {
    ARN: `arn://${TEST_SECRET_NO_VALUE_ID}`,
    CreatedDate: new Date("2020-03-15T12:00:00Z").getTime(),
    Name: TEST_SECRET_NO_VALUE_ID,
    VersionId: "1.0",
    VersionStages: ["prod"],
  },
};

export default secrets;
