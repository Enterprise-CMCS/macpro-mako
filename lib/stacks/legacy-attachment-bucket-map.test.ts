import { describe, expect, it } from "vitest";

import {
  getLegacyAttachmentBucketMapParameterName,
  getLegacyAttachmentMirrorBuckets,
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
        "mako-production-legacy-attachments-123456789012",
        "mako-production-legacy-attachmentsbucket-123456789012",
      ],
      arns: [
        "arn:aws:s3:::mako-production-legacy-attachments-123456789012",
        "arn:aws:s3:::mako-production-legacy-attachmentsbucket-123456789012",
      ],
    });
  });
});
