import { MimeType, fileTypeFromFile } from "file-type";
import { lookup } from "mime-types";
import * as constants from "./constants";
import fs from "fs";
import * as path from "path";
import readline from "readline";
import pino from "pino";
const logger = pino();

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

async function getFileTypeFromContents(filePath: string): Promise<MimeType | false> {
  try {
    const fileBuffer = await fs.promises.readFile(filePath);

    // Get the file type from its contents
    const type = await fileTypeFromFile(filePath);

    if (!type) {
      switch (path.extname(filePath)) {
        case ".csv":
          logger.info("Checking csv another way...");
          if (await looksLikeCsv(filePath, ",", 100)) {
            return lookup(".csv") as MimeType;
          }
          break;
        case ".txt":
          logger.info("Checking txt another way...");
          if (await looksLikeTxt(fileBuffer)) {
            return lookup(".txt") as MimeType;
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
