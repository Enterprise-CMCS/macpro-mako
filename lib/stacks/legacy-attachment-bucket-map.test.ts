import { describe, expect, it } from "vitest";

import {
  getLegacyAttachmentBucketMapParameterName,
  getLegacyAttachmentMirrorBuckets,
  getSharedAttachmentReadBucket,
  resolveAttachmentReadStage,
  resolveLegacyAttachmentBucketMapStage,
} from "./legacy-attachment-bucket-map";

describe("resolveLegacyAttachmentBucketMapStage", () => {
  it("keeps the main stage parameter mapping", () => {
    expect(resolveLegacyAttachmentBucketMapStage("main")).toBe("main");
  });

  it("keeps the val stage parameter mapping", () => {
    expect(resolveLegacyAttachmentBucketMapStage("val")).toBe("val");
  });

  it("keeps the production stage parameter mapping", () => {
    expect(resolveLegacyAttachmentBucketMapStage("production")).toBe("production");
  });

  it("routes migrate to the main stage parameter mapping", () => {
    expect(resolveLegacyAttachmentBucketMapStage("migrate")).toBe("main");
  });

  it("routes arbitrary branch stages to the main stage parameter mapping", () => {
    expect(resolveLegacyAttachmentBucketMapStage("feature-x")).toBe("main");
  });
});

describe("getLegacyAttachmentBucketMapParameterName", () => {
  it("builds the parameter path from the effective mapping stage", () => {
    expect(getLegacyAttachmentBucketMapParameterName("mako", "migrate")).toBe(
      "/mako/main/legacy-attachment-bucket-map",
    );
  });
});

describe("resolveAttachmentReadStage", () => {
  it("keeps the main attachment read stage", () => {
    expect(resolveAttachmentReadStage("main")).toBe("main");
  });

  it("routes ephemeral stages to main attachment reads", () => {
    expect(resolveAttachmentReadStage("migrate")).toBe("main");
    expect(resolveAttachmentReadStage("feature-x")).toBe("main");
  });
});

describe("getSharedAttachmentReadBucket", () => {
  it("builds the main attachment read bucket for migrate", () => {
    expect(getSharedAttachmentReadBucket("mako", "migrate", "123456789012")).toEqual({
      stage: "main",
      name: "mako-main-attachments-123456789012",
      arn: "arn:aws:s3:::mako-main-attachments-123456789012",
    });
  });

  it("keeps production attachment reads stage-local", () => {
    expect(getSharedAttachmentReadBucket("mako", "production", "123456789012")).toEqual({
      stage: "production",
      name: "mako-production-attachments-123456789012", // pragma: allowlist secret
      arn: "arn:aws:s3:::mako-production-attachments-123456789012",
    });
  });
});

describe("getLegacyAttachmentMirrorBuckets", () => {
  it("builds main mirror bucket resources for migrate", () => {
    expect(getLegacyAttachmentMirrorBuckets("mako", "migrate", "123456789012")).toEqual({
      stage: "main",
      names: [
        "mako-main-legacy-attachments-123456789012",
        "mako-main-legacy-attachmentsbucket-123456789012",
      ],
      arns: [
        "arn:aws:s3:::mako-main-legacy-attachments-123456789012",
        "arn:aws:s3:::mako-main-legacy-attachmentsbucket-123456789012",
      ],
    });
  });

  it("builds production mirror bucket resources without remapping", () => {
    expect(getLegacyAttachmentMirrorBuckets("mako", "production", "123456789012")).toEqual({
      stage: "production",
      names: [
        "mako-production-legacy-attachments-123456789012", // pragma: allowlist secret
        "mako-production-legacy-attachmentsbucket-123456789012", // pragma: allowlist secret
      ],
      arns: [
        "arn:aws:s3:::mako-production-legacy-attachments-123456789012",
        "arn:aws:s3:::mako-production-legacy-attachmentsbucket-123456789012",
      ],
    });
  });
});
