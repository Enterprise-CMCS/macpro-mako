import { cn } from "@/utils";
import { useCallback, useState } from "react";
import { useDropzone, FileRejection, Accept } from "react-dropzone";
import * as I from "@/components/Inputs";
import { X } from "lucide-react";
import { FILE_TYPES } from "shared-types/uploads";
import { v4 as uuidv4 } from "uuid";

type UploadProps = {
  maxFiles?: number;
  files: File[];
  setFiles: (files: File[]) => void;
};

export const Upload = ({ maxFiles, files, setFiles }: UploadProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const uniqueId = uuidv4();

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        setErrorMessage(
          "Selected file(s) is too large or of a disallowed file type.",
        );
      } else {
        setErrorMessage(null);
        setFiles([...files, ...acceptedFiles]);
      }
    },
    [files],
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
              key={file.name}
            >
              <span className="text-sky-700">{file.name}</span>
              <I.Button
                onClick={(e) => {
                  e.preventDefault();
                  setFiles(files.filter((a) => a.name !== file.name));
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

        {/* {isDragActive && <p>Drag is Active</p>} */}
      </div>
    </>
  );
};

Upload.displayName = "Upload";
