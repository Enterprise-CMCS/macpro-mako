import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import { lookup } from "mime-types";
import path from "path";
import pino from "pino";
import readline from "readline";
import { inflateRawSync } from "zlib";

import * as constants from "./constants";
const logger = pino();

const OOXML_ZIP_FILE_TYPES = {
  ".docx": {
    requiredPrefix: "word/",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  ".pptx": {
    requiredPrefix: "ppt/",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  ".xlsx": {
    requiredPrefix: "xl/",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
} as const;

const ODF_ZIP_FILE_TYPES = {
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".odt": "application/vnd.oasis.opendocument.text",
} as const;

type ZipEntry = {
  compressedSize: number;
  compressionMethod: number;
  filename: string;
  localHeaderOffset: number;
};

export async function checkFileExt(pathToFile: string): Promise<string> {
  try {
    // Calculate the mime type based off the extension.
    const mimeTypeFromExtension = lookup(path.extname(pathToFile));

    // Error out if mimeTypes couldn't figure out the mime type.
    if (!mimeTypeFromExtension) {
      logger.info("FAILURE - CANNOT DETERMINE MIMETYPE FROM EXTENSION");
      return constants.STATUS_UNKNOWN_EXTENSION;
    }

    // Error out if the extension is not allowed
    if (!isAllowedMime(mimeTypeFromExtension)) {
      logger.info("FAILURE - EXTENSION IS NOT OF AN ALLOWED TYPE");
      return constants.STATUS_UNKNOWN_EXTENSION;
    }

    // Caclulate the mime type based off the file's contents.
    const mimeTypeFromContents = await getFileTypeFromContents(pathToFile);
    // Error out if file-type couldn't determine the mime type.
    if (!mimeTypeFromContents) {
      logger.info("FAILURE - CANNOT DETERMINE MIMETYPE FROM CONTENTS");
      return constants.STATUS_UNKNOWN_EXTENSION;
    }

    // Log
    logger.info(`File mimetype from extension:  ${mimeTypeFromExtension}`);
    logger.info(`File mimetype from contents:   ${mimeTypeFromContents}`);

    // Check if the mimes are equivalent
    const same = areMimeTypesEquivalent(mimeTypeFromExtension, mimeTypeFromContents);
    // Error out if we can't determine equivalence
    if (!same) {
      logger.info(
        `FAILURE - MIMETYPE CALCULATED FROM EXTENSION DOES NOT MATCH MIMETYPE CALCULATED FROM CONTENTS`,
      );
      return constants.STATUS_EXTENSION_MISMATCH_FILE;
    }

    // Otherwise, so far it's clean
    return constants.STATUS_CLEAN_FILE;
  } catch {
    logger.error("Error Checking file extension");
    return constants.STATUS_ERROR_PROCESSING_FILE;
  }
}

function isAllowedMime(mime: string): boolean {
  return FILE_TYPES.some((fileType) => fileType.mime === mime);
}

async function getFileTypeFromContents(filePath: string): Promise<string | false> {
  try {
    const fileBuffer = await fs.promises.readFile(filePath);

    // Get the file type from its contents
    const type = await fileTypeFromBuffer(fileBuffer);
    const extension = path.extname(filePath).toLowerCase();

    if (!type || type.mime === "application/zip") {
      const zipContainerMime = getZipContainerMimeFromContents(fileBuffer, extension);
      if (zipContainerMime) {
        return zipContainerMime;
      }
    }

    if (!type) {
      switch (extension) {
        case ".csv":
          logger.info("Checking csv another way...");
          if (await looksLikeCsv(filePath, ",", 100)) {
            return lookup(".csv") as string;
          }
          break;
        case ".txt":
          logger.info("Checking txt another way...");
          if (await looksLikeTxt(fileBuffer)) {
            return lookup(".txt") as string;
          }
          break;
        default:
          logger.info("Could not determine file type.");
          return false;
      }
    }

    if (!type?.mime) {
      logger.info(`getFileTypeFromContents: File determined to be mime:${type?.mime}`);
      return false;
    }
    logger.info(
      `getFileTypeFromContents:  File determined to be mime:${type.mime} ext:${type.ext}`,
    );
    return type.mime;
  } catch (error) {
    console.error("Error reading file:", error);
    return false;
  }
}

function getZipContainerMimeFromContents(fileBuffer: Buffer, extension: string): string | false {
  const zipEntries = readZipEntries(fileBuffer);
  if (!zipEntries) {
    return false;
  }

  const ooxmlType = OOXML_ZIP_FILE_TYPES[extension as keyof typeof OOXML_ZIP_FILE_TYPES];
  if (ooxmlType) {
    const filenames = new Set(zipEntries.map((entry) => entry.filename));
    if (
      filenames.has("[Content_Types].xml") &&
      zipEntries.some((entry) => entry.filename.startsWith(ooxmlType.requiredPrefix))
    ) {
      logger.info(`Detected OOXML container for ${extension}`);
      return ooxmlType.mime;
    }

    return false;
  }

  const odfMime = ODF_ZIP_FILE_TYPES[extension as keyof typeof ODF_ZIP_FILE_TYPES];
  if (!odfMime) {
    return false;
  }

  const mimetypeEntry = zipEntries.find((entry) => entry.filename === "mimetype");
  if (!mimetypeEntry) {
    return false;
  }

  const mimetypeBuffer = readZipEntryContents(fileBuffer, mimetypeEntry);
  if (!mimetypeBuffer) {
    return false;
  }

  const mimetype = mimetypeBuffer.toString("utf8");
  if (mimetype === odfMime) {
    logger.info(`Detected ODF container for ${extension}`);
    return odfMime;
  }

  return false;
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  const minOffset = Math.max(0, buffer.length - 0xffff - 22);

  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }

  return -1;
}

function readZipEntries(buffer: Buffer): ZipEntry[] | undefined {
  const endOfCentralDirectoryOffset = findEndOfCentralDirectory(buffer);
  if (endOfCentralDirectoryOffset < 0) {
    return undefined;
  }

  const centralDirectoryOffset = buffer.readUInt32LE(endOfCentralDirectoryOffset + 16);
  const totalEntries = buffer.readUInt16LE(endOfCentralDirectoryOffset + 10);
  const entries: ZipEntry[] = [];
  let offset = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) {
      return undefined;
    }

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const filenameLength = buffer.readUInt16LE(offset + 28);
    const extraFieldLength = buffer.readUInt16LE(offset + 30);
    const fileCommentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const filenameOffset = offset + 46;
    const filenameEndOffset = filenameOffset + filenameLength;

    if (filenameEndOffset > buffer.length) {
      return undefined;
    }

    entries.push({
      compressedSize,
      compressionMethod,
      filename: buffer.toString("utf8", filenameOffset, filenameEndOffset),
      localHeaderOffset,
    });

    offset = filenameEndOffset + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function readZipEntryContents(buffer: Buffer, entry: ZipEntry): Buffer | undefined {
  if (entry.localHeaderOffset + 30 > buffer.length) {
    return undefined;
  }

  if (buffer.readUInt32LE(entry.localHeaderOffset) !== 0x04034b50) {
    return undefined;
  }

  const filenameLength = buffer.readUInt16LE(entry.localHeaderOffset + 26);
  const extraFieldLength = buffer.readUInt16LE(entry.localHeaderOffset + 28);
  const dataOffset = entry.localHeaderOffset + 30 + filenameLength + extraFieldLength;
  const dataEndOffset = dataOffset + entry.compressedSize;

  if (dataEndOffset > buffer.length) {
    return undefined;
  }

  const contents = buffer.subarray(dataOffset, dataEndOffset);

  if (entry.compressionMethod === 0) {
    return contents;
  }

  if (entry.compressionMethod === 8) {
    return inflateRawSync(contents);
  }

  return undefined;
}

function areMimeTypesEquivalent(mime1: string, mime2: string): boolean {
  const equivalentTypes: { [key: string]: Set<string> } = {
    "application/rtf": new Set(["text/rtf"]),
    "application/vnd.ms-excel": new Set(["application/x-cfb"]),
    "application/vnd.ms-powerpoint": new Set(["application/x-cfb"]),
    "application/msword": new Set(["application/x-cfb", "application/rtf"]),
  };
  mime1 = mime1.toLowerCase();
  mime2 = mime2.toLowerCase();
  if (mime1 === mime2) {
    return true;
  }
  for (const baseType in equivalentTypes) {
    logger.info("Mime types not identical... checking AKAs for equivalence...");
    const equivalents = equivalentTypes[baseType];
    if (
      (mime1 === baseType && equivalents.has(mime2)) ||
      (mime2 === baseType && equivalents.has(mime1))
    ) {
      return true;
    }
  }
  return false;
}

function looksLikeTxt(buffer: Buffer): boolean {
  return !buffer.some((byte) => {
    return (
      byte < 0x09 ||
      (byte > 0x0d && byte < 0x20) || // Control characters excluding tab, newline, and carriage return
      byte > 0x7e // Beyond ASCII printable characters
    );
  });
}

export type FileTypeInfo = {
  extension: string;
  description: string;
  mime: string;
};

export const FILE_TYPES: FileTypeInfo[] = [
  { extension: ".bmp", description: "Bitmap Image File", mime: "image/bmp" },
  {
    extension: ".csv",
    description: "Comma-separated Values",
    mime: "text/csv",
  },
  {
    extension: ".doc",
    description: "MS Word Document",
    mime: "application/msword",
  },
  {
    extension: ".docx",
    description: "MS Word Document (xml)",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    extension: ".gif",
    description: "Graphics Interchange Format",
    mime: "image/gif",
  },
  {
    extension: ".jpeg",
    description: "Joint Photographic Experts Group",
    mime: "image/jpeg",
  },
  {
    extension: ".odp",
    description: "OpenDocument Presentation (OpenOffice)",
    mime: "application/vnd.oasis.opendocument.presentation",
  },
  {
    extension: ".ods",
    description: "OpenDocument Spreadsheet (OpenOffice)",
    mime: "application/vnd.oasis.opendocument.spreadsheet",
  },
  {
    extension: ".odt",
    description: "OpenDocument Text (OpenOffice)",
    mime: "application/vnd.oasis.opendocument.text",
  },
  {
    extension: ".png",
    description: "Portable Network Graphic",
    mime: "image/png",
  },
  {
    extension: ".pdf",
    description: "Portable Document Format",
    mime: "application/pdf",
  },
  {
    extension: ".ppt",
    description: "MS Powerpoint File",
    mime: "application/vnd.ms-powerpoint",
  },
  {
    extension: ".pptx",
    description: "MS Powerpoint File (xml)",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  {
    extension: ".rtf",
    description: "Rich Text Format",
    mime: "application/rtf",
  },
  { extension: ".tif", description: "Tagged Image Format", mime: "image/tiff" },
  { extension: ".txt", description: "Text File Format", mime: "text/plain" },
  {
    extension: ".xls",
    description: "MS Excel File",
    mime: "application/vnd.ms-excel",
  },
  {
    extension: ".xlsx",
    description: "MS Excel File (xml)",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
];

async function looksLikeCsv(
  filePath: string,
  delimiter: string = ",",
  maxLinesToCheck: number = 10,
): Promise<boolean> {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  let previousNumberOfFields = 0;

  for await (const line of rl) {
    lineNumber++;

    // Skip empty lines
    if (line.trim() === "") continue;

    const fields = line.split(delimiter);

    // Check if the number of fields is consistent across rows
    if (lineNumber > 1 && fields.length !== previousNumberOfFields) {
      return false;
    }

    previousNumberOfFields = fields.length;

    if (lineNumber >= maxLinesToCheck) {
      break;
    }
  }

  return true;
}
