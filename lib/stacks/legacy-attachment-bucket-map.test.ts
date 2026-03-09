import { describe, expect, it } from "vitest";

import {
  getLegacyAttachmentBucketMapParameterName,
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
