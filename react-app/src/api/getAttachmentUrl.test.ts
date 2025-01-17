import { describe, expect, it } from "vitest";
import { getAttachmentUrl } from "./getAttachmentUrl";
import { ATTACHMENT_BUCKET_NAME, ATTACHMENT_BUCKET_REGION, errorAttachmentUrlHandler } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";

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
    mockedServer.use(errorAttachmentUrlHandler);

    await expect(() =>
      getAttachmentUrl(id, ATTACHMENT_BUCKET_NAME, key, filename),
    ).rejects.toThrowError();
  });
});
