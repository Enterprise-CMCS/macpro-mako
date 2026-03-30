import { describe, expect, it } from "vitest";

import { buildAttachmentArchiveCurrent } from "./archive-manifest";
import { resolveAttachmentArchiveCurrentState } from "./current-state";

describe("resolveAttachmentArchiveCurrentState", () => {
  it("keeps ready archives ready when the artifact exists", () => {
    const current = buildAttachmentArchiveCurrent({
      scope: "all",
      hash: "hash",
      status: "READY",
      artifactKey: "archive.zip",
      manifestKey: "archive.manifest.json",
      attachmentCount: 2,
    });

    expect(
      resolveAttachmentArchiveCurrentState({
        expectedHash: "hash",
        current,
        artifactExists: true,
      }),
    ).toEqual({ action: "ready" });
  });

  it("rebuilds ready archives when the artifact is missing", () => {
    const current = buildAttachmentArchiveCurrent({
      scope: "all",
      hash: "hash",
      status: "READY",
      artifactKey: "archive.zip",
      manifestKey: "archive.manifest.json",
      attachmentCount: 2,
    });

    expect(
      resolveAttachmentArchiveCurrentState({
        expectedHash: "hash",
        current,
        artifactExists: false,
      }),
    ).toEqual({ action: "rebuild", reason: "missing_artifact" });
  });

  it("keeps running archives pending when the execution is still active", () => {
    const current = buildAttachmentArchiveCurrent({
      scope: "all",
      hash: "hash",
      status: "RUNNING",
      artifactKey: "archive.zip",
      manifestKey: "archive.manifest.json",
      attachmentCount: 2,
      executionArn: "arn:aws:states:us-east-1:123456789012:execution:test:running",
    });

    expect(
      resolveAttachmentArchiveCurrentState({
        expectedHash: "hash",
        current,
        artifactExists: false,
        hasRunningExecution: true,
      }),
    ).toEqual({ action: "in_progress", status: "RUNNING" });
  });

  it("rebuilds running archives when the execution is no longer active", () => {
    const current = buildAttachmentArchiveCurrent({
      scope: "all",
      hash: "hash",
      status: "RUNNING",
      artifactKey: "archive.zip",
      manifestKey: "archive.manifest.json",
      attachmentCount: 2,
      executionArn: "arn:aws:states:us-east-1:123456789012:execution:test:stale",
    });

    expect(
      resolveAttachmentArchiveCurrentState({
        expectedHash: "hash",
        current,
        artifactExists: false,
        hasRunningExecution: false,
      }),
    ).toEqual({ action: "rebuild", reason: "execution_not_running" });
  });

  it("rebuilds legacy in-progress archives after the stale threshold", () => {
    const current = {
      ...buildAttachmentArchiveCurrent({
        scope: "section",
        hash: "hash",
        status: "PENDING",
        artifactKey: "archive.zip",
        manifestKey: "archive.manifest.json",
        attachmentCount: 1,
        sectionId: "section-a",
        sectionNumber: 1,
        sectionLabel: "initial-package-submitted",
        sectionFolderName: "section-1-initial-package-submitted",
      }),
      updatedAt: "2026-03-12T00:00:00.000Z",
    };

    expect(
      resolveAttachmentArchiveCurrentState({
        expectedHash: "hash",
        current,
        artifactExists: false,
        nowMs: Date.parse("2026-03-12T00:31:00.000Z"),
      }),
    ).toEqual({ action: "rebuild", reason: "legacy_in_progress_stale" });
  });
});
