import { cn } from "@/lib";
import { useCallback, useState } from "react";
import { useDropzone, FileRejection, Accept } from "react-dropzone";
import * as I from "@/components/Inputs";
import { X } from "lucide-react";
import { FILE_TYPES } from "shared-types/uploads";

type UploadProps = {
  maxFiles?: number;
  value?: File[];
  onChange: (files: File[]) => void;
  setError?: (e: string) => void;
};

export const Upload = ({
  maxFiles,
  value = [],
  onChange,
  setError,
}: UploadProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const errormsg =
          "Selected file(s) is too large or of a disallowed file type.";
        setError ? setError(errormsg) : setErrorMessage(errormsg);
      } else {
        setErrorMessage(null);
        onChange([...value, ...acceptedFiles]);
      }
    },
    [value]
  );

  const accept: Accept = {};
  FILE_TYPES.map((type) =>
    accept[type.mime]
      ? accept[type.mime].push(type.extension)
      : (accept[type.mime] = [type.extension])
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: 80 * 1024 * 1024, // 80MB,
  });

  return (
    <>
      <div className="my-2 flex gap-2">
        {value.map((file) => (
          // <div key={file.name} className="my-2 flex gap-2">
          <div
            className="flex border-2 rounded-md py-1 pl-2.5 pr-1 border-sky-500 items-center"
            key={file.name}
          >
            <span className="text-sky-700">{file.name}</span>
            <I.Button
              onClick={(e) => {
                e.preventDefault();
                onChange(value.filter((a) => a.name !== file.name));
              }}
              variant="ghost"
              className="p-0 h-0"
            >
              <X className="ml-2 text-sky-700 w-5" />
            </I.Button>
            {/* </div> */}
          </div>
        ))}
      </div>
      {errorMessage && <span className="text-red-500">{errorMessage}</span>}
      <div
        {...getRootProps()}
        className={cn(
          "w-full flex items-center justify-center border border-dashed  py-6 rounded-sm",
          isDragActive && "border-blue-700"
        )}
      >
        <p>
          Drag file here or{" "}
          <span className="text-sky-700 underline hover:cursor-pointer">
            choose from folder
          </span>
        </p>
        <input {...getInputProps()} />
        {/* {isDragActive && <p>Drag is Active</p>} */}
      </div>
    </>
  );
};

Upload.displayName = "Upload";
