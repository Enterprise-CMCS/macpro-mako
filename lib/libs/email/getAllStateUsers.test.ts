import { getAllStateUsers } from "./getAllStateUsers";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("./getAllStateUsers");

describe("getAllStateUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch users successfully", async () => {
    vi.mocked(getAllStateUsers).mockResolvedValue([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        formattedEmailAddress: "John Doe <john.doe@example.com>",
      },
    ]);

    const result = await getAllStateUsers("CA");
    expect(result).toEqual([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        formattedEmailAddress: "John Doe <john.doe@example.com>",
      },
    ]);
  });

  it("should return an empty array when no users are found", async () => {
    vi.mocked(getAllStateUsers).mockResolvedValue([]);

    const result = await getAllStateUsers("CA");
    expect(result).toEqual([]);
  });

  it("should throw an error when there is an issue fetching users", async () => {
    vi.mocked(getAllStateUsers).mockRejectedValue(
      new Error("Error fetching users"),
    );

    await expect(getAllStateUsers("CA")).rejects.toThrow(
      "Error fetching users",
    );
  });
});
