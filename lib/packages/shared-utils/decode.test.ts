import { describe, it, expect } from "vitest";
import { decodeBase64WithUtf8 } from ".";

describe("decodeBase64WithUtf8", () => {
  it("should decode a base64 encoded string to UTF-8", () => {
    const base64Encoded = "SGVsbG8sIHdvcmxkIQ=="; // "Hello, world!" in base64
    const expectedDecodedString = "Hello, world!";
    const result = decodeBase64WithUtf8(base64Encoded);
    expect(result).toBe(expectedDecodedString);
  });

  it("should handle empty string", () => {
    const base64Encoded = "";
    const expectedDecodedString = "";
    const result = decodeBase64WithUtf8(base64Encoded);
    expect(result).toBe(expectedDecodedString);
  });

  it("should handle base64 encoded non-ASCII characters", () => {
    const base64Encoded =
      "dGhlIHdvcmQgZW1vamkgY29tZXMgZnJvbSBKYXBhbmVzZSBlICjntbUsICdwaWN0dXJlJykgKyBtb2ppICjmloflrZcsICdjaGFyYWN0ZXInKQ=="; // pragma: allowlist secret
    const expectedDecodedString =
      "the word emoji comes from Japanese e (絵, 'picture') + moji (文字, 'character')";
    const result = decodeBase64WithUtf8(base64Encoded);
    expect(result).toBe(expectedDecodedString);
  });
});
