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
