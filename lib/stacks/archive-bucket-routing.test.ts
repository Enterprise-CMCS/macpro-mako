import { describe, expect, it } from "vitest";

import {
  getArchiveBaseReadBucket,
  getArchiveOverlayPrefix,
  getEphemeralArchiveOverlayBucket,
  isSharedArchiveStage,
  resolveArchiveBaseReadStage,
} from "./archive-bucket-routing";

describe("isSharedArchiveStage", () => {
  it("treats main, val, and production as shared archive stages", () => {
    expect(isSharedArchiveStage("main")).toBe(true);
    expect(isSharedArchiveStage("val")).toBe(true);
    expect(isSharedArchiveStage("production")).toBe(true);
  });

  it("treats ephemeral stages as non-shared archive stages", () => {
    expect(isSharedArchiveStage("migrate")).toBe(false);
    expect(isSharedArchiveStage("feature-x")).toBe(false);
  });
});

describe("resolveArchiveBaseReadStage", () => {
  it("keeps shared stages local", () => {
    expect(resolveArchiveBaseReadStage("main")).toBe("main");
    expect(resolveArchiveBaseReadStage("val")).toBe("val");
  });

  it("routes ephemeral stages to main archive reads", () => {
    expect(resolveArchiveBaseReadStage("migrate")).toBe("main");
    expect(resolveArchiveBaseReadStage("feature-x")).toBe("main");
  });
});

describe("getArchiveBaseReadBucket", () => {
  it("builds the main archive read bucket for migrate", () => {
    expect(getArchiveBaseReadBucket("mako", "migrate", "123456789012")).toEqual({
      stage: "main",
      name: "mako-main-attachment-archives-123456789012", // pragma: allowlist secret
      arn: "arn:aws:s3:::mako-main-attachment-archives-123456789012", // pragma: allowlist secret
    });
  });

  it("keeps production archive reads stage-local", () => {
    expect(getArchiveBaseReadBucket("mako", "production", "123456789012")).toEqual({
      stage: "production",
      name: "mako-production-attachment-archives-123456789012", // pragma: allowlist secret
      arn: "arn:aws:s3:::mako-production-attachment-archives-123456789012", // pragma: allowlist secret
    });
  });
});

describe("getEphemeralArchiveOverlayBucket", () => {
  it("builds the shared overlay bucket", () => {
    expect(getEphemeralArchiveOverlayBucket("mako", "123456789012")).toEqual({
      name: "mako-ephemeral-attachment-archives-123456789012", // pragma: allowlist secret
      arn: "arn:aws:s3:::mako-ephemeral-attachment-archives-123456789012", // pragma: allowlist secret
    });
  });
});

describe("getArchiveOverlayPrefix", () => {
  it("prefixes ephemeral stages", () => {
    expect(getArchiveOverlayPrefix("migrate")).toBe("stage/migrate");
    expect(getArchiveOverlayPrefix("feature-x")).toBe("stage/feature-x");
  });

  it("does not prefix shared stages", () => {
    expect(getArchiveOverlayPrefix("main")).toBe("");
    expect(getArchiveOverlayPrefix("production")).toBe("");
  });
});
