// lib/libs/email/getAllStateUsers.test.ts
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", () => {
  // Local to the factory to avoid hoisting/TDZ problems
  const postMock = vi.fn();

  const axiosInstance = {
    post: postMock,
  };

  const axiosDefault = Object.assign(postMock, {
    // Support both axios.post(...) and axios.create().post(...)
    post: postMock,
    create: vi.fn(() => axiosInstance),
    isAxiosError: (err: unknown) => (err as any)?.isAxiosError === true,
    // Expose the mock for our assertions
    __postMock: postMock,
  });

  return { default: axiosDefault };
});

type AxiosMock = typeof axios & {
  __postMock: ReturnType<typeof vi.fn>;
};

const mockedAxios = axios as AxiosMock;

import { getAllStateUsers } from "./getAllStateUsers";

const USER_POOL_ID = "test-user-pool-id";

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
  });
});
