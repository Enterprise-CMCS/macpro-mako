import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSecret } from ".";

const mockSend = vi.fn();

vi.mock("@aws-sdk/client-secrets-manager", () => {
  return {
    SecretsManagerClient: vi.fn(() => ({
      send: mockSend,
    })),
    GetSecretValueCommand: vi.fn(),
    DescribeSecretCommand: vi.fn(),
  };
});

describe("getSecret", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("should return the secret value if the secret exists and is not marked for deletion", async () => {
    const secretId = "test-secret";
    const expectedSecretValue = "test-secret-value"; // pragma: allowlist secret

    mockSend
      .mockResolvedValueOnce({ DeletedDate: null }) // Mock DescribeSecretCommand response
      .mockResolvedValueOnce({ SecretString: expectedSecretValue }); // Mock GetSecretValueCommand response

    const result = await getSecret(secretId);
    expect(result).toBe(expectedSecretValue);
  });

  it("should throw an error if the secret is marked for deletion", async () => {
    const secretId = "test-secret";

    mockSend.mockResolvedValueOnce({ DeletedDate: new Date() }); // Mock DescribeSecretCommand response

    await expect(getSecret(secretId)).rejects.toThrow(
      `Secret ${secretId} is marked for deletion and will not be used.`,
    );
  });

  it("should throw an error if the secret has no SecretString field", async () => {
    const secretId = "test-secret";

    mockSend
      .mockResolvedValueOnce({ DeletedDate: null }) // Mock DescribeSecretCommand response
      .mockResolvedValueOnce({ SecretString: null }); // Mock GetSecretValueCommand response

    await expect(getSecret(secretId)).rejects.toThrow(
      `Secret ${secretId} has no SecretString field present in response`,
    );
  });

  it("should throw an error if there is an issue with the AWS SDK call", async () => {
    const secretId = "test-secret";
    const errorMessage = "AWS SDK error";

    mockSend.mockRejectedValueOnce(new Error(errorMessage)); // Mock DescribeSecretCommand failure

    await expect(getSecret(secretId)).rejects.toThrow(
      `Failed to fetch secret ${secretId}: Error: ${errorMessage}`,
    );
  });
});
