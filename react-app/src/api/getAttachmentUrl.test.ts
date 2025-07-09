import { API } from "aws-amplify";
import {
  ATTACHMENT_BUCKET_NAME,
  ATTACHMENT_BUCKET_REGION,
  errorApiAttachmentUrlHandler,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { getAttachmentUrl } from "./getAttachmentUrl";
vi.mock("@/utils/ReactGA/SendGAEvent", () => {
  return {
    sendGAEvent: vi.fn(),
  };
});
describe("getAttachmentUrl tests", () => {
  const id = "1234";
  const key = "test-key";
  const filename = "test-file.txt";

  it("should return a url", async () => {
    const url = await getAttachmentUrl(id, ATTACHMENT_BUCKET_NAME, key, filename);
    expect(url).toEqual(
      `https://s3.${ATTACHMENT_BUCKET_REGION}.amazonaws.com/${ATTACHMENT_BUCKET_NAME}/${id}-${key}-${filename}`,
    );
  });

  it("should throw an error if the response is 500", async () => {
    mockedServer.use(errorApiAttachmentUrlHandler);

    await expect(() =>
      getAttachmentUrl(id, ATTACHMENT_BUCKET_NAME, key, filename),
    ).rejects.toThrowError();
  });

  it("should send a GA event if the response has no URL", async () => {
    vi.spyOn(API, "post").mockResolvedValue({});

    await expect(
      getAttachmentUrl(id, ATTACHMENT_BUCKET_NAME, key, filename),
    ).resolves.toBeUndefined();

    expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
      "api_error",
      expect.objectContaining({
        message: "failure /getAttachmentUrl",
      }),
    );
  });
});
