import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { deflateRawSync } from "zlib";

import {
  STATUS_CLEAN_FILE,
  STATUS_EXTENSION_MISMATCH_FILE,
  STATUS_UNKNOWN_EXTENSION,
} from "./constants";
import { checkFileExt } from "./file-ext";

type ZipFixtureEntry = {
  compression?: 0 | 8;
  contents: Buffer | string;
  name: string;
};

const tempDirs: string[] = [];

function createZipBuffer(entries: ZipFixtureEntry[]) {
  const localParts: Buffer[] = [];
  const centralDirectoryParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const filenameBuffer = Buffer.from(entry.name);
    const contentsBuffer =
      typeof entry.contents === "string" ? Buffer.from(entry.contents, "utf8") : entry.contents;
    const compression = entry.compression ?? 0;
    const compressedBuffer =
      compression === 8 ? deflateRawSync(contentsBuffer) : Buffer.from(contentsBuffer);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(compression, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(0, 14);
    localHeader.writeUInt32LE(compressedBuffer.length, 18);
    localHeader.writeUInt32LE(contentsBuffer.length, 22);
    localHeader.writeUInt16LE(filenameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(compression, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(0, 16);
    centralHeader.writeUInt32LE(compressedBuffer.length, 20);
    centralHeader.writeUInt32LE(contentsBuffer.length, 24);
    centralHeader.writeUInt16LE(filenameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    localParts.push(localHeader, filenameBuffer, compressedBuffer);
    centralDirectoryParts.push(centralHeader, filenameBuffer);

    offset += localHeader.length + filenameBuffer.length + compressedBuffer.length;
  }

  const centralDirectory = Buffer.concat(centralDirectoryParts);
  const endOfCentralDirectory = Buffer.alloc(22);
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
  endOfCentralDirectory.writeUInt16LE(0, 4);
  endOfCentralDirectory.writeUInt16LE(0, 6);
  endOfCentralDirectory.writeUInt16LE(entries.length, 8);
  endOfCentralDirectory.writeUInt16LE(entries.length, 10);
  endOfCentralDirectory.writeUInt32LE(centralDirectory.length, 12);
  endOfCentralDirectory.writeUInt32LE(offset, 16);
  endOfCentralDirectory.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, endOfCentralDirectory]);
}

async function writeTempFile(filename: string, contents: Buffer) {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "clamav-file-ext-"));
  tempDirs.push(tempDir);
  const filePath = path.join(tempDir, filename);
  await fs.promises.writeFile(filePath, contents);
  return filePath;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => fs.promises.rm(dir, { recursive: true, force: true })),
  );
});

describe("checkFileExt", () => {
  it("accepts OOXML containers when generic zip detection is not specific enough", async () => {
    const filePath = await writeTempFile(
      "document.xlsx",
      createZipBuffer([
        {
          name: "[Content_Types].xml",
          contents: '<?xml version="1.0"?><Types />',
        },
        {
          name: "xl/workbook.xml",
          contents: "<workbook />",
          compression: 8,
        },
      ]),
    );

    await expect(checkFileExt(filePath)).resolves.toBe(STATUS_CLEAN_FILE);
  });

  it("accepts ODF containers when the mimetype entry matches exactly", async () => {
    const filePath = await writeTempFile(
      "document.ods",
      createZipBuffer([
        {
          name: "mimetype",
          contents: "application/vnd.oasis.opendocument.spreadsheet",
        },
        {
          name: "content.xml",
          contents: "<office:document-content />",
          compression: 8,
        },
      ]),
    );

    await expect(checkFileExt(filePath)).resolves.toBe(STATUS_CLEAN_FILE);
  });

  it("rejects generic zip containers with office extensions when the structure does not match", async () => {
    const filePath = await writeTempFile(
      "document.xlsx",
      createZipBuffer([
        {
          name: "notes.txt",
          contents: "plain zip contents",
        },
      ]),
    );

    const status = await checkFileExt(filePath);

    expect([STATUS_EXTENSION_MISMATCH_FILE, STATUS_UNKNOWN_EXTENSION]).toContain(status);
  });

  it("keeps ordinary zip uploads blocked", async () => {
    const filePath = await writeTempFile(
      "document.zip",
      createZipBuffer([
        {
          name: "notes.txt",
          contents: "plain zip contents",
        },
      ]),
    );

    await expect(checkFileExt(filePath)).resolves.toBe(STATUS_UNKNOWN_EXTENSION);
  });
});
