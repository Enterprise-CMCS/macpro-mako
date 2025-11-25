// getAllStateUsers.test.ts
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

const USER_POOL_ID = "test-user-pool-id";

// We’ll control this single post mock for all tests
const postMock = vi.fn();

// Hoisted by Vitest so it affects getAllStateUsers' import of axios
vi.mock("axios", () => {
  return {
    default: {
      // getAllStateUsers might call axios.post(...)
      post: postMock,
      // or axios.create(...).post(...)
      create: () => ({ post: postMock }),
      // if implementation ever checks this, keep a simple helper
      isAxiosError: (err: unknown) => (err as any)?.isAxiosError === true,
    },
  };
});

describe("getAllStateUsers", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("should fetch and return state users successfully", async () => {
    // This shape matches what you’ve seen in logs
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

    // axios POST resolves with the data above
    postMock.mockResolvedValueOnce({ data: apiResponse });

    const result = await getAllStateUsers({
      userPoolId: USER_POOL_ID,
      state: "CA",
    });

    // Basic expectations – adjust if you want stricter checks
    expect(postMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(apiResponse);
  });

  it("should handle an error when fetching state users", async () => {
    // Make axios throw
    postMock.mockRejectedValueOnce(new Error("network error"));

    await expect(getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" })).rejects.toThrow(
      "Error fetching users",
    );

    expect(postMock).toHaveBeenCalledTimes(1);
  });
});
