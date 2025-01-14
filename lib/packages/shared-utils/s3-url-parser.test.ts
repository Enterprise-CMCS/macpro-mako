import { describe, it, expect } from "vitest";
import { s3ParseUrl } from "./s3-url-parser";

describe("s3ParseUrl", () => {
  it("parses URL with format http://s3.amazonaws.com/bucket/key1/key2", () => {
    const result = s3ParseUrl("http://s3.amazonaws.com/bucket/key1/key2");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key1/key2",
      region: "",
    });
  });

  it("parses URL with format http://s3-aws-region.amazonaws.com/bucket/key1/key2", () => {
    const result = s3ParseUrl("http://s3-us-west-2.amazonaws.com/bucket/key1/key2");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key1/key2",
      region: "us-west-2",
    });
  });

  it("parses URL with format http://bucket.s3.amazonaws.com/key1/key2", () => {
    const result = s3ParseUrl("http://bucket.s3.amazonaws.com/key1/key2");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key1/key2",
      region: "",
    });
  });

  it("parses URL with format http://bucket.s3-aws-region.amazonaws.com/key1/key2", () => {
    const result = s3ParseUrl("http://bucket.s3-us-west-2.amazonaws.com/key1/key2");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key1/key2",
      region: "us-west-2",
    });
  });

  it("parses URL with format http://bucket.s3.aws-region.amazonaws.com/key1/key2", () => {
    const result = s3ParseUrl("http://bucket.s3.us-west-2.amazonaws.com/key1/key2");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key1/key2",
      region: "us-west-2",
    });
  });

  it("returns null for invalid URLs", () => {
    expect(s3ParseUrl("http://invalid-url.com")).toBeNull();
    expect(s3ParseUrl("http://s3.amazonaws.com/")).toBeNull();
    expect(s3ParseUrl("")).toBeNull();
  });
});
