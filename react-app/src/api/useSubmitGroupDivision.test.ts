import { defaultCMSUser, errorApiOptionSubmitGroupDivisionHandler, setMockUsername } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { submitGroupDivision } from "./useSubmitGroupDivision";

describe("submitGroupDivision hook", () => {
  it("should throw an error if the user is not authenticated", async () => {
    setMockUsername(null);
    await expect(() =>
      submitGroupDivision({ group: "Group1", division: "Division1" }),
    ).rejects.toThrowError("Failed to submit group and division: ");
  });

  it("should return a success message if the group and division were submitter successfully", async () => {
    setMockUsername(defaultCMSUser);

    const result = await submitGroupDivision({ group: "Group1", division: "Division1" });
    expect(result).toEqual({ message: "Group and division submitted successfully." });
  });

  it("should throw an error if there is an error", async () => {
    mockedServer.use(errorApiOptionSubmitGroupDivisionHandler);
    setMockUsername(defaultCMSUser);

    await expect(() =>
      submitGroupDivision({ group: "Group1", division: "Division1" }),
    ).rejects.toThrowError("Failed to submit group and division");
  });
});
