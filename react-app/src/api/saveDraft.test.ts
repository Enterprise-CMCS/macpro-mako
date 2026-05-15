import { API } from "aws-amplify";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { saveDraft, type SaveDraftPayload } from "./saveDraft";

vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));

describe("saveDraft tests", () => {
  const payload: SaveDraftPayload = {
    id: "MD-26-0001-P",
    originalDraftId: "MD-26-0000-P",
    event: "new-medicaid-submission",
    authority: "Medicaid SPA",
    draftData: {
      id: "MD-26-0001-P",
      additionalInformation: "Draft notes",
    },
    ifSeqNo: 1,
    ifPrimaryTerm: 2,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the draft payload to the saveDraft endpoint", async () => {
    const response = {
      message: "Draft saved",
      id: payload.id,
      seqNo: 3,
      primaryTerm: 4,
    };
    const postSpy = vi.spyOn(API, "post").mockResolvedValue(response);

    await expect(saveDraft(payload)).resolves.toEqual(response);

    expect(postSpy).toHaveBeenCalledWith("os", "/saveDraft", {
      body: payload,
    });
  });

  it("sends a GA event and rethrows when the request fails", async () => {
    const error = new Error("save failed");
    vi.spyOn(API, "post").mockRejectedValue(error);

    await expect(saveDraft(payload)).rejects.toThrow(error);

    expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
      "api_error",
      expect.objectContaining({
        error: `failure /saveDraft ${payload.id}`,
      }),
    );
  });
});
