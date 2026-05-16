import { API } from "aws-amplify";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { deleteDraft } from "./deleteDraft";

vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));

describe("deleteDraft tests", () => {
  const id = "MD-26-0001-P";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the draft id to the deleteDraft endpoint", async () => {
    const response = { message: "Draft deleted", id };
    const postSpy = vi.spyOn(API, "post").mockResolvedValue(response);

    await expect(deleteDraft(id)).resolves.toEqual(response);

    expect(postSpy).toHaveBeenCalledWith("os", "/deleteDraft", {
      body: { id },
    });
  });

  it("sends a GA event and rethrows when the request fails", async () => {
    const error = new Error("delete failed");
    vi.spyOn(API, "post").mockRejectedValue(error);

    await expect(deleteDraft(id)).rejects.toThrow(error);

    expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
      "api_error",
      expect.objectContaining({
        error: `failure /deleteDraft ${id}`,
      }),
    );
  });
});
