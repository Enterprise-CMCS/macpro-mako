import { getAllStateUsers } from "./getAllStateUsers";
import { describe, it, expect } from "vitest";
import { USER_POOL_ID } from "mocks";

describe("getAllStateUsers", () => {
  it("should fetch users successfully", async () => {
    const result = await getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" });
    expect(result).toEqual([
      {
        firstName: "George",
        lastName: "Harrison",
        email: "george@example.com",
        formattedEmailAddress: "George Harrison <george@example.com>",
      },
      {
        firstName: "State",
        lastName: "Multi",
        email: "statemulti@example.com",
        formattedEmailAddress: "State Multi <statemulti@example.com>",
      },
      {
        firstName: "Otto",
        lastName: "State",
        email: "automated-state@example.com",
        formattedEmailAddress: "Otto State <automated-state@example.com>",
      },
    ]);
  });

  it("should return an empty array when no users are found", async () => {
    const result = await getAllStateUsers({ userPoolId: USER_POOL_ID, state: "MA" });
    expect(result).toEqual([]);
  });
});
