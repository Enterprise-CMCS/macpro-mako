import { describe, expect, it } from "vitest";

import {
  buildAttachmentArchiveCurrent,
  buildPackageAttachmentArchiveManifest,
  buildSectionAttachmentArchiveManifest,
  getArchiveArtifactKey,
  getArchiveCurrentKey,
  getArchiveDownloadFilename,
  getArchiveManifestKey,
  getPackageArchiveRootFolderName,
  parseAttachmentArchiveCurrent,
} from "./archive-manifest";
import { ATTACHMENT_ARCHIVE_BUILD_VERSION } from "./types";

describe("attachment archive manifest helpers", () => {
  it("builds a stable section hash regardless of source attachment order", () => {
    const first = buildSectionAttachmentArchiveManifest({
      packageId: "MD-25-2525-IJJJ",
      scope: "section",
      sectionId: "section-a",
      sectionNumber: 2,
      sectionLabel: "rai-response-submitted",
      sectionFolderName: "section-2-rai-response-submitted",
      rootFolderName: "MD-25-2525-IJJJ-section-2-rai-response-submitted",
      attachments: [
        {
          bucket: "bucket-b",
          key: "z-key",
          filename: "b.pdf",
          title: "B",
        },
        {
          bucket: "bucket-a",
          key: "a-key",
          filename: "a.pdf",
          title: "A",
        },
      ],
    });
    const second = buildSectionAttachmentArchiveManifest({
      packageId: "MD-25-2525-IJJJ",
      scope: "section",
      sectionId: "section-a",
      sectionNumber: 2,
      sectionLabel: "rai-response-submitted",
      sectionFolderName: "section-2-rai-response-submitted",
      rootFolderName: "MD-25-2525-IJJJ-section-2-rai-response-submitted",
      attachments: [
        {
          bucket: "bucket-a",
          key: "a-key",
          filename: "a.pdf",
          title: "A",
        },
        {
          bucket: "bucket-b",
          key: "z-key",
          filename: "b.pdf",
          title: "B",
        },
      ],
    });

    expect(first.hash).toBe(second.hash);
    expect(first.buildVersion).toBe(ATTACHMENT_ARCHIVE_BUILD_VERSION);
    expect(first.attachments.map((attachment) => attachment.archiveFilename)).toEqual([
      "a.pdf",
      "b.pdf",
    ]);
  });

  it("only adds duplicate suffixes when filenames collide within a section", () => {
    const manifest = buildSectionAttachmentArchiveManifest({
      packageId: "MD-25-2525-IJJJ",
      scope: "section",
      sectionId: "section-a",
      sectionNumber: 1,
      sectionLabel: "initial-package-submitted",
      sectionFolderName: "section-1-initial-package-submitted",
      rootFolderName: "MD-25-2525-IJJJ-section-1-initial-package-submitted",
      attachments: [
        {
          bucket: "bucket-a",
          key: "key-1",
          filename: "duplicate.pdf",
          title: "A",
        },
        {
          bucket: "bucket-b",
          key: "key-2",
          filename: "duplicate.pdf",
          title: "B",
        },
        {
          bucket: "bucket-c",
          key: "key-3",
          filename: "duplicate (2).pdf",
          title: "C",
        },
      ],
    });

    expect(manifest.attachments.map((attachment) => attachment.archiveFilename)).toEqual([
      "duplicate (2).pdf",
      "duplicate.pdf",
      "duplicate (3).pdf",
    ]);
  });

  it("builds package manifests from section manifests", () => {
    const sectionManifest = buildSectionAttachmentArchiveManifest({
      packageId: "MD-25-2525-IJJJ",
      scope: "section",
      sectionId: "section-a",
      sectionNumber: 1,
      sectionLabel: "initial-package-submitted",
      sectionFolderName: "section-1-initial-package-submitted",
      rootFolderName: "MD-25-2525-IJJJ-section-1-initial-package-submitted",
      attachments: [
        {
          bucket: "bucket-a",
          key: "key-1",
          filename: "file.pdf",
          title: "A",
        },
      ],
    });

    const manifest = buildPackageAttachmentArchiveManifest({
      packageId: "MD-25-2525-IJJJ",
      sections: [
        {
          sectionId: sectionManifest.sectionId,
          sectionNumber: sectionManifest.sectionNumber,
          sectionLabel: sectionManifest.sectionLabel,
          sectionFolderName: sectionManifest.sectionFolderName,
          rootFolderName: sectionManifest.rootFolderName,
          artifactKey: "package/MD-25-2525-IJJJ/section/section-a/hash.zip",
          attachmentCount: sectionManifest.attachments.length,
          hash: sectionManifest.hash,
          manifestKey: "package/MD-25-2525-IJJJ/section/section-a/hash.manifest.json",
        },
      ],
    });

    expect(manifest.version).toBe(2);
    expect(manifest.buildVersion).toBe(ATTACHMENT_ARCHIVE_BUILD_VERSION);
    expect(manifest.rootFolderName).toBe(getPackageArchiveRootFolderName("MD-25-2525-IJJJ"));
    expect(manifest.sections).toHaveLength(1);
  });

  it("builds archive keys and download filenames for package and section scopes", () => {
    expect(getArchiveCurrentKey({ packageId: "MD-25-2525-IJJJ", scope: "all" })).toBe(
      "package/MD-25-2525-IJJJ/all/current.json",
    );
    expect(getArchiveManifestKey({ packageId: "MD-25-2525-IJJJ", scope: "all" }, "hash")).toBe(
      "package/MD-25-2525-IJJJ/all/hash.manifest.json",
    );
    expect(
      getArchiveArtifactKey(
        { packageId: "MD-25-2525-IJJJ", scope: "section", sectionId: "abc" },
        "hash",
      ),
    ).toBe("package/MD-25-2525-IJJJ/section/abc/hash.zip");
    expect(
      getArchiveDownloadFilename({
        packageId: "MD-25-2525-IJJJ",
        scope: "all",
        now: new Date("2026-03-23T18:00:00.000Z"),
      }),
    ).toBe("MD-25-2525-IJJJ - Mon Mar 23 2026.zip");
    expect(
      getArchiveDownloadFilename({
        packageId: "MD-25-2525-IJJJ",
        scope: "section",
        sectionNumber: 2,
        sectionLabel: "rai-response-submitted",
      }),
    ).toBe("MD-25-2525-IJJJ-section-2-rai-response-submitted-attachments.zip");
  });

  it("parses valid current.json payloads and rejects invalid values", () => {
    const current = buildAttachmentArchiveCurrent({
      scope: "section",
      hash: "hash",
      status: "PENDING",
      artifactKey: "artifact.zip",
      manifestKey: "manifest.json",
      attachmentCount: 2,
      appendedAttachmentCount: 1,
      skippedAttachmentCount: 1,
      executionArn: "arn:aws:states:us-east-1:123456789012:execution:test:archive",
      sectionId: "section-a",
      sectionNumber: 1,
      sectionLabel: "initial-package-submitted",
      sectionFolderName: "section-1-initial-package-submitted",
      failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
      failureMessage:
        "The attachments in this section are no longer available, so this download could not be created.",
    });

    expect(parseAttachmentArchiveCurrent(JSON.stringify(current))).toEqual(current);
    expect(parseAttachmentArchiveCurrent("not-json")).toBeUndefined();
    expect(parseAttachmentArchiveCurrent(JSON.stringify({ status: "READY" }))).toBeUndefined();
    expect(
      parseAttachmentArchiveCurrent(
        JSON.stringify({
          ...current,
          blockedAttachment: {
            bucket: "bucket-only",
          },
        }),
      ),
    ).toBeUndefined();
  });
});
