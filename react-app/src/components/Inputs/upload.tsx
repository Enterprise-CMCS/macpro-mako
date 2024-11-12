import { cn } from "@/utils";
import { useCallback, useState } from "react";
import { useDropzone, FileRejection, Accept } from "react-dropzone";
import * as I from "@/components/Inputs";
import { X } from "lucide-react";
import { FILE_TYPES } from "shared-types/uploads";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { LoadingSpinner } from "@/components/LoadingSpinner"; // Import your LoadingSpinner component
import { attachmentSchema } from "shared-types";
import { extractBucketAndKeyFromUrl, getPresignedUrl, uploadToS3 } from "./upload.utilities";

type Attachment = z.infer<typeof attachmentSchema>;

type UploadProps = {
  maxFiles?: number;
  files: Attachment[];
  setFiles: (files: Attachment[]) => void;
  dataTestId?: string;
};

/**
 * Upload component for handling file uploads with drag-and-drop functionality.
 *
 * @param {Object} props - The properties object.
 * @param {number} props.maxFiles - The maximum number of files that can be uploaded.
 * @param {Attachment[]} props.files - The current list of uploaded files.
 * @param {Function} props.setFiles - Function to update the list of uploaded files.
 * @param {string} props.dataTestId - The data-testid attribute for testing purposes.
 *
 * @returns {JSX.Element} The rendered Upload component.
 *
 * @component
 * @example
 * const [files, setFiles] = useState<Attachment[]>([]);
 * return (
 *   <Upload
 *     maxFiles={5}
 *     files={files}
 *     setFiles={setFiles}
 *     dataTestId="file-upload"
 *   />
 * );
 */
export const Upload = ({ maxFiles, files, setFiles, dataTestId }: UploadProps) => {
  const [isUploading, setIsUploading] = useState(false); // New state for tracking upload status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const uniqueId = uuidv4();

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        setErrorMessage("Selected file(s) is too large or of a disallowed file type.");
      } else {
        setErrorMessage(null);
        setIsUploading(true); // Set uploading to true

        const processedFiles = await Promise.all(
          acceptedFiles.map(async (file) => {
            try {
              const url = await getPresignedUrl(file.name);
              const { bucket, key } = extractBucketAndKeyFromUrl(url);
              await uploadToS3(file, url);

              const attachment: Attachment = {
                filename: file.name,
                title: file.name.split(".").slice(0, -1).join("."),
                bucket,
                key,
                uploadDate: Date.now(),
              };

              return attachment;
            } catch (error) {
              setErrorMessage("Failed to upload one or more files.");
              console.error("Upload error:", error);
              return null;
            }
          }),
        );

        const validAttachments = processedFiles.filter(
          (attachment) => attachment !== null,
        ) as Attachment[];

        setFiles([...files, ...validAttachments]);
        setIsUploading(false); // Set uploading to false when done
      }
    },
    [files, setFiles],
  );

  const accept: Accept = {};
  FILE_TYPES.map((type) =>
    accept[type.mime]
      ? accept[type.mime].push(type.extension)
      : (accept[type.mime] = [type.extension]),
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: 80 * 1024 * 1024, // 80MB,
    disabled: isUploading, // Disable dropzone while uploading
  });

  return (
    <>
      {files.length > 0 && (
        <div className="my-2 flex flex-wrap gap-2">
          {files.map((file) => (
            <div
              className="flex border-2 rounded-md py-1 pl-2.5 pr-1 border-sky-500 items-center"
              key={file.filename}
            >
              <span className="text-sky-700">{file.filename}</span>
              <I.Button
                onClick={(e) => {
                  e.preventDefault();
                  setFiles(files.filter((a) => a.filename !== file.filename));
                }}
                variant="ghost"
                className="p-0 h-0"
              >
                <X className="ml-2 text-sky-700 w-5" />
              </I.Button>
            </div>
          ))}
        </div>
      )}
      {errorMessage && <span className="text-red-500">{errorMessage}</span>}
      {isUploading ? (
        <LoadingSpinner /> // Render the loading spinner when uploading
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "w-full flex items-center justify-center border border-dashed border-[#71767a] py-6 rounded-sm",
            isDragActive && "border-blue-700",
          )}
        >
          <p>
            Drag file here or{" "}
            <span className="text-sky-700 underline hover:cursor-pointer">choose from folder</span>
          </p>
          <label htmlFor={`upload-${uniqueId}`} className="sr-only">
            Drag file here or choose from folder
          </label>
          <input
            id={`upload-${uniqueId}`}
            {...getInputProps()}
            data-testid={`${dataTestId}-upload`}
          />
        </div>
      )}
    </>
  );
};

Upload.displayName = "Upload";
