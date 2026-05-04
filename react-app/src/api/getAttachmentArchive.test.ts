import { API } from "aws-amplify";
import { errorApiAttachmentArchiveHandler } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { getAttachmentArchive } from "./getAttachmentArchive";

vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));

describe("getAttachmentArchive tests", () => {
  it("returns a ready attachment archive response", async () => {
    await expect(getAttachmentArchive("1234", "all")).resolves.toEqual(
      expect.objectContaining({
        status: "READY",
        url: expect.stringContaining("1234"),
      }),
    );
  });

  it("throws an error if the response is 500", async () => {
    mockedServer.use(errorApiAttachmentArchiveHandler);

    await expect(() => getAttachmentArchive("1234", "all")).rejects.toThrowError();
  });

  it("sends a GA event if the response has no status", async () => {
    vi.spyOn(API, "post").mockResolvedValue({});

    await expect(getAttachmentArchive("1234", "all")).rejects.toThrow(
      "Attachment archive response was missing a status",
    );

    expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
      "api_error",
      expect.objectContaining({
        message: "failure /getAttachmentArchive for 1234 (all)",
      }),
    );
  });

  it("passes preferDraft through to the API body when requested", async () => {
    const postSpy = vi.spyOn(API, "post").mockResolvedValue({
      status: "READY",
      filename: "1234-attachments.zip",
      url: "https://example.com/1234-attachments.zip",
    });

    await getAttachmentArchive("1234", "all", undefined, { preferDraft: true });

    expect(postSpy).toHaveBeenCalledWith("os", "/getAttachmentArchive", {
      body: {
        id: "1234",
        scope: "all",
        preferDraft: true,
      },
    });
  });
});
