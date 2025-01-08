import { TestSecretData } from "../index.d";

export const TEST_SECRET_ID = "test-secret"; // pragma: allowlist secret
export const TEST_SECRET_TO_DELETE_ID = "test-secret-to-delete"; // pragma: allowlist secret
export const TEST_SECRET_NO_VALUE_ID = "test-secret-no-value"; // pragma: allowlist secret
export const TEST_SECRET_ERROR_ID = "Throw Get Secret Error"; // pragma: allowlist secret
export const TEST_PW_ARN = "test-arn-create-update-user"; // pragma: allowlist secret
export const TEST_EMAIL_ID = "mock-email-secret";

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
  [TEST_EMAIL_ID]: {
    ARN: `arn://${TEST_EMAIL_ID}`,
    CreatedDate: new Date("2023-01-01T12:00:00Z").getTime(),
    Name: TEST_EMAIL_ID,
    SecretString:
      "{" +
      '"osgEmail": ["osg@example.com"],' +
      '"dpoEmail": ["dpo@example.com"],' +
      '"dmcoEmail": ["dmco@example.com"],' +
      '"dhcbsooEmail": ["dhcbsoo@example.com"],' +
      '"chipInbox": ["chip.inbox@example.com"],' +
      '"chipCcList": ["chip.cc1@example.com", "chip.cc2@example.com"],' +
      '"sourceEmail": "source@example.com",' +
      '"srtEmails": ["srt1@example.com", "srt2@example.com"],' +
      '"cpocEmail": ["cpoc@example.com"]' +
      "}",
    VersionId: "1.0",
    VersionStages: ["prod"],
  },
};

export default secrets;
