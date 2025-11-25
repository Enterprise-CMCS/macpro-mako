// lib/libs/email/getAllStateUsers.test.ts

import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

const USER_POOL_ID = "test-user-pool-id";

describe("getAllStateUsers", () => {
  let postSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on axios.post for this test file only
    postSpy = vi.spyOn(axios, "post");
  });

  afterEach(() => {
    postSpy.mockRestore();
  });

  it("should fetch and return state users successfully", async () => {
    const apiResponse = [
      {
        email: "multistate@example.com",
        firstName: "Multi",
        formattedEmailAddress: "Multi State <multistate@example.com>",
        lastName: "State",
      },
      {
        email: "statesubmitter@nightwatch.test",
        firstName: "State",
        formattedEmailAddress: "State Submitter Test <statesubmitter@nightwatch.test>",
        lastName: "Submitter Test",
      },
      {
        email: "george@example.com",
        firstName: "George",
        formattedEmailAddress: "George Harrison <george@example.com>",
        lastName: "Harrison",
      },
    ];

    postSpy.mockResolvedValueOnce({ data: apiResponse });

    const result = await getAllStateUsers({
      userPoolId: USER_POOL_ID,
      state: "CA",
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(apiResponse);
  });

  it("should handle an error when fetching state users", async () => {
    // Force axios to reject for this call – no MSW, no network
    postSpy.mockRejectedValueOnce(new Error("network error"));

    await expect(
      getAllStateUsers({
        userPoolId: USER_POOL_ID,
        state: "CA",
      }),
    ).rejects.toThrow("Error fetching users");
  });
});
