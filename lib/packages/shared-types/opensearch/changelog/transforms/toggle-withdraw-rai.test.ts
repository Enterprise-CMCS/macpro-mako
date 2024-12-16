import { describe, it, expect, vi, beforeEach } from "vitest";
import { transform } from "./toggle-withdraw-rai";
import { events } from "shared-types";

const file_name = "toggle-withdraw-rai";
vi.mock("shared-types", () => ({
  events: {
    "toggle-withdraw-rai": {
      schema: {
        transform: vi.fn(),
      },
    },
  },
}));

describe("transform function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle attachments with empty files array", () => {
    const mockData = {
      id: "123",
    };

    const expectedResult = {
      packageId: "123",
      id: "123-5",
      isAdminChange: true,
    };

    (events[file_name].schema.transform as jest.Mock).mockImplementation((callback) =>
      callback(mockData),
    );

    const result = transform(5);
    console.log(result);
    expect(result).toEqual(expectedResult);
  });
});
