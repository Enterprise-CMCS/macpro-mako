import React from "react";

interface FileTypeInfo {
  extension: string;
  description: string;
}
/** The source of truth for filetypes accepted as attachments in forms. */
export const FILE_TYPES: FileTypeInfo[] = [
  { extension: ".bmp", description: "Bitmap Image File" },
  { extension: ".csv", description: "Comma-separated Values" },
  { extension: ".doc", description: "MS Word Document" },
  { extension: ".docx", description: "MS Word Document (xml)" },
  { extension: ".gif", description: "Graphics Interchange Format" },
  { extension: ".jpeg", description: "Joint Photographic Experts Group" },
  { extension: ".odp", description: "OpenDocument Presentation (OpenOffice)" },
  { extension: ".ods", description: "OpenDocument Spreadsheet (OpenOffice)" },
  { extension: ".odt", description: "OpenDocument Text (OpenOffice)" },
  { extension: ".png", description: "Portable Network Graphic" },
  { extension: ".pdf", description: "Portable Document Format" },
  { extension: ".ppt", description: "MS Powerpoint File" },
  { extension: ".pptx", description: "MS Powerpoint File (xml)" },
  { extension: ".rtf", description: "Rich Text Format" },
  { extension: ".tif", description: "Tagged Image Format" },
  { extension: ".txt", description: "Text File Format" },
  { extension: ".xls", description: "MS Excel File" },
  { extension: ".xlsx", description: "MS Excel File (xml)" },
];

export const FileTypesFAQListItem = ({ info }: { info: FileTypeInfo }) => {
  return (
    <div className="file-type-list-item">
      <b>{info.extension}</b>
      <p>{info.description}</p>
    </div>
  );
};
