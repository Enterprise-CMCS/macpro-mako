import { TEST_CF_EXPORT_ID, TEST_CF_EXPORT_NOT_FOUND_ID, errorCloudFormationHandler } from "mocks";
import { mockedServiceServer } from "mocks/server";
import { describe, expect, it } from "vitest";
import { getExport } from "./cloudformation";

describe("getExport", () => {
  it("should return the export value if the export exists", async () => {
    const result = await getExport(TEST_CF_EXPORT_ID);
    expect(result).toBe("test-value");
  });

  it("should throw an error if the export does not exist", async () => {
    await expect(getExport(TEST_CF_EXPORT_NOT_FOUND_ID)).rejects.toThrow(
      `Export with name ${TEST_CF_EXPORT_NOT_FOUND_ID} does not exist.`,
    );
  });

  it("should throw an error if there is an issue with the AWS SDK call", async () => {
    mockedServiceServer.use(errorCloudFormationHandler);

    await expect(getExport(TEST_CF_EXPORT_ID)).rejects.toThrow("UnknownError");
  });
});
