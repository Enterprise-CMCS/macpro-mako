import { TestSecretData } from "../index.d";

export const TEST_SECRET_ID = "test-secret"; // pragma: allowlist secret
export const TEST_SECRET_TO_DELETE_ID = "test-secret-to-delete"; // pragma: allowlist secret
export const TEST_SECRET_NO_VALUE_ID = "test-secret-no-value"; // pragma: allowlist secret
export const TEST_SECRET_ERROR_ID = "Throw Get Secret Error"; // pragma: allowlist secret
export const TEST_PW_ARN = "test-arn-create-update-user"; // pragma: allowlist secret

const secrets: Record<string, TestSecretData> = {
  [TEST_SECRET_ID]: {
    ARN: `arn://${TEST_SECRET_ID}`,
    CreatedDate: new Date("2023-01-01T12:00:00Z").getTime(),
    Name: TEST_SECRET_ID,
    SecretString: "test-secret-value", // pragma: allowlist secret
    VersionId: "1.0",
    VersionStages: ["prod"],
  },
  [TEST_SECRET_TO_DELETE_ID]: {
    ARN: `arn://${TEST_SECRET_TO_DELETE_ID}`,
    CreatedDate: new Date("2022-01-01T12:00:00Z").getTime(),
    DeletedDate: new Date("2022-12-31T23:59:59Z").getTime(),
    Name: TEST_SECRET_TO_DELETE_ID,
    SecretString: "deleted-test-secret-value", // pragma: allowlist secret
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
  [TEST_PW_ARN]: {
    ARN: `arn://${TEST_PW_ARN}`,
    CreatedDate: Date.now(),
    Name: TEST_PW_ARN,
    SecretString: "devUserPassword", // pragma: allowlist secret
    VersionId: "1.0",
    VersionStages: ["prod"],
  },
};

export default secrets;
