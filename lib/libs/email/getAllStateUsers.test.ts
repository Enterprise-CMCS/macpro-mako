// lib/libs/email/getAllStateUsers.test.ts
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

const USER_POOL_ID = "test-user-pool-id";

/**
 * Completely mock axios for this file only.
 * - No MSW
 * - No identity provider mock server
 * - No wrapAxiosError spy
 *
 * Everything that calls axios (including axios.create().post) will hit the same postMock.
 */
vi.mock("axios", () => {
  const postMock = vi.fn();

  const createMock = vi.fn(() => ({
    post: postMock,
  }));

  // Default export: callable function that delegates to postMock
  const axiosFn: any = (...args: any[]) => postMock(...args);

  axiosFn.post = postMock;
  axiosFn.create = createMock;
  axiosFn.isAxiosError = (err: any) => !!err?.isAxiosError;

  return { default: axiosFn };
});

type AxiosMock = typeof axios & {
  post: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
};

const mockedAxios = axios as AxiosMock;

describe("getAllStateUsers", () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
    mockedAxios.create.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    mockedAxios.post.mockResolvedValueOnce({ data: apiResponse });

    const result = await getAllStateUsers({
      userPoolId: USER_POOL_ID,
      state: "CA",
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(result).toEqual(apiResponse);
  });

  it("should handle an error when fetching state users", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("network error"));

    await expect(
      getAllStateUsers({
        userPoolId: USER_POOL_ID,
        state: "CA",
      }),
    ).rejects.toThrow("Error fetching users");
  });
});
