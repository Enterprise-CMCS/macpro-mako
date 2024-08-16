import { cn } from "@/utils";
import { useCallback, useState } from "react";
import { useDropzone, FileRejection, Accept } from "react-dropzone";
import * as I from "@/components/Inputs";
import { X } from "lucide-react";
import { FILE_TYPES } from "shared-types/uploads";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { attachmentSchema } from "shared-types";
import { API } from "aws-amplify";

type Attachment = z.infer<typeof attachmentSchema>;

type UploadProps = {
  maxFiles?: number;
  files: Attachment[];
  setFiles: (files: Attachment[]) => void;
};

export const Upload = ({ maxFiles, files, setFiles }: UploadProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const uniqueId = uuidv4();

  const getPresignedUrl = async (fileName: string): Promise<string> => {
    const response = await API.post("os", "/getUploadUrl", {
      body: { fileName },
    });
    return response.url;
  };

  const uploadToS3 = async (file: File, url: string): Promise<void> => {
    await fetch(url, {
      body: file,
      method: "PUT",
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        setErrorMessage(
          "Selected file(s) is too large or of a disallowed file type.",
        );
      } else {
        setErrorMessage(null);

        const processedFiles = await Promise.all(
          acceptedFiles.map(async (file) => {
            try {
              // Get presigned URL
              const url = await getPresignedUrl(file.name);

              // Upload file to S3 using the presigned URL
              await uploadToS3(file, url);

              // Create attachment object
              const attachment: Attachment = {
                filename: file.name,
                title: file.name.split(".").slice(0, -1).join("."), // Example logic for title
                bucket: "your-bucket-name", // Replace with actual bucket logic
                key: `${uniqueId}/${file.name}`, // Example logic for key
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

        // Filter out any null attachments (from failed uploads)
        const validAttachments = processedFiles.filter(
          (attachment) => attachment !== null,
        ) as Attachment[];

        setFiles([...files, ...validAttachments]);
      }
    },
    [files, setFiles, uniqueId],
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
      <div
        {...getRootProps()}
        className={cn(
          "w-full flex items-center justify-center border border-dashed border-[#71767a] py-6 rounded-sm",
          isDragActive && "border-blue-700",
        )}
      >
        <p>
          Drag file here or{" "}
          <span className="text-sky-700 underline hover:cursor-pointer">
            choose from folder
          </span>
        </p>
        <label htmlFor={`upload-${uniqueId}`} className="sr-only">
          Drag file here or choose from folder
        </label>
        <input id={`upload-${uniqueId}`} {...getInputProps()} />
      </div>
    </>
  );
};

Upload.displayName = "Upload";
