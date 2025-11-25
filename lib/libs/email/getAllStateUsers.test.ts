// lib/libs/email/getAllStateUsers.test.ts
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

const USER_POOL_ID = "test-user-pool-id";

// Hoisted mock: everything lives inside the factory, no external variables
vi.mock("axios", () => {
  const postMock = vi.fn();
  const createMock = vi.fn(() => ({ post: postMock }));

  // We return something that looks like the axios default export
  const axiosDefault = Object.assign(postMock, {
    post: postMock,
    create: createMock,
    isAxiosError: (err: unknown) => (err as any)?.isAxiosError === true,
    __postMock: postMock, // expose for tests
  });

  return { default: axiosDefault };
});

type AxiosMock = typeof axios & {
  __postMock: ReturnType<typeof vi.fn>;
};

const mockedAxios = axios as AxiosMock;

describe("getAllStateUsers", () => {
  beforeEach(() => {
    mockedAxios.__postMock.mockReset();
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

    mockedAxios.__postMock.mockResolvedValueOnce({ data: apiResponse });

    const result = await getAllStateUsers({
      userPoolId: USER_POOL_ID,
      state: "CA",
    });

    expect(mockedAxios.__postMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(apiResponse);
  });

  it("should handle an error when fetching state users", async () => {
    mockedAxios.__postMock.mockRejectedValueOnce(new Error("network error"));

    await expect(getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" })).rejects.toThrow(
      "Error fetching users",
    );

    expect(mockedAxios.__postMock).toHaveBeenCalledTimes(1);
  });
});
