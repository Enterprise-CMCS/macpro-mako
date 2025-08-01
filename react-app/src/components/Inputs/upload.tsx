import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { FileError, FileRejection, useDropzone } from "react-dropzone";
import { attachmentSchema } from "shared-types";
import { FILE_TYPES } from "shared-types/uploads";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { userPrompt } from "@/components";
import * as I from "@/components/Inputs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/utils";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { mapSubmissionTypeBasedOnActionFormTitle } from "../../utils/ReactGA/Mapper";
import { extractBucketAndKeyFromUrl, getPresignedUrl, uploadToS3 } from "./uploadUtilities";

type Attachment = z.infer<typeof attachmentSchema>;

type UploadProps = {
  maxFiles?: number;
  files: Attachment[];
  setFiles: (files: Attachment[]) => void;
  dataTestId?: string;
  type?: string;
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
export const Upload = ({ maxFiles, files, setFiles, dataTestId, type }: UploadProps) => {
  const dropzoneRef = useRef<HTMLDivElement | null>(null);

  const [isUploading, setIsUploading] = useState(false); // New state for tracking upload status
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);
  const uniqueId = uuidv4();
  const MAX_FILE_SIZE = 80 * 1024 * 1024; //80 MB
  const accept = FILE_TYPES.reduce(
    (acc, { mime, extension }) => {
      acc[mime] = acc[mime] ? [...acc[mime], extension] : [extension];
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const existingFileNames = files.map((file) => file.filename);

  const validateFile = (file: File) => {
    if (existingFileNames.includes(file.name)) {
      return {
        code: "file-already-exists",
        message: `File with name "${file.name}" already exists.`,
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        code: "file-too-big",
        message: `File "${file.name}" is too large to upload.`,
      };
    }
    // The error message by default for drop zone is really wordy so this will replace that.  We filter it on the output
    if (!Object.keys(accept).includes(file.type)) {
      return {
        code: "file-invalid-type-replacement",
        message: `File "${file.name}" has an invalid type.`,
      };
    }
  };
  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const fileType = dropzoneRef.current?.getAttribute("data-label");
      const submissionType = mapSubmissionTypeBasedOnActionFormTitle(type);
      if (acceptedFiles[0]) {
        sendGAEvent("submit_file_upload", {
          submission_type: submissionType,
          file_type: fileType,
          file_size_bytes: acceptedFiles[0].size,
        });
      }
      setRejectedFiles(fileRejections);
      if (fileRejections.length === 0) {
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
            } catch {
              const fileError: FileError = {
                message: `Failed to upload ${file.name}`,
                code: "fail-to-upload",
              };

              const uploadError: FileRejection = {
                file: file,
                errors: [fileError],
              };

              setRejectedFiles((prev) => [...prev, uploadError]);
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
    [files, setFiles, type],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    validator: validateFile,
    maxFiles,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading, // Disable dropzone while uploading
  });

  return (
    <>
      {files.length > 0 && (
        <div className="my-2 flex flex-wrap gap-2">
          {files.map((file) => (
            <div
              data-testid={`${file.filename}-chip`}
              className="flex border-2 rounded-md py-1 pl-2.5 pr-1 border-sky-500 items-center"
              key={file.filename}
            >
              <span className="text-sky-700">{file.filename}</span>
              <I.Button
                type="button"
                onClick={() =>
                  userPrompt({
                    header: "Remove Attachment?",
                    body: `Are you sure you want to remove ${file.filename}?`,
                    acceptButtonText: "Yes, remove",
                    onAccept: () => {
                      setRejectedFiles([]);
                      setFiles(files.filter((a) => a.filename !== file.filename));
                    },
                  })
                }
                variant="ghost"
                className="p-0 h-0"
                data-testid={`${dataTestId}-remove-file-${file.filename}`}
              >
                <X className="ml-2 text-sky-700 w-5" />
              </I.Button>
            </div>
          ))}
        </div>
      )}

      {isUploading ? (
        <LoadingSpinner /> // Render the loading spinner when uploading
      ) : (
        <div
          {...getRootProps()}
          ref={dropzoneRef}
          data-label={dataTestId}
          className={cn(
            "w-full flex items-center justify-center border border-dashed border-[#71767a] py-6 rounded-sm",
            isDragActive && "border-blue-700",
          )}
        >
          <p>
            Drag file here or{" "}
            <span
              data-testid={`${dataTestId}-click`}
              className="text-sky-700 underline hover:cursor-pointer"
            >
              choose from folder
            </span>
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

      {rejectedFiles.length > 0 && (
        <span className="text-[0.8rem] font-medium text-destructive">
          {rejectedFiles.flatMap(({ file, errors }) =>
            errors
              .filter((e) => e.code !== "file-invalid-type" && e.code !== "file-too-large")
              .map((e) => <p key={`${file.name}-${e.code}`}>{e.message}</p>),
          )}
        </span>
      )}
    </>
  );
};

Upload.displayName = "Upload";
