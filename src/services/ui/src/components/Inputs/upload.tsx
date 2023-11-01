import { cn } from "@/lib";
import { useCallback, forwardRef, useState } from "react";
import { useDropzone } from "react-dropzone";

type UploadProps = {
  maxFiles?: number;
  files: File[];
  setFiles: (files: File[]) => void;
};

export const Upload = ({ maxFiles, files, setFiles }: UploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "w-full flex items-center justify-center border-2 border-dashed border-slate-600 py-6 rounded-sm",
          isDragActive && "border-blue-700"
        )}
      >
        <p>
          Drag file here or{" "}
          <a href="#" className="text-blue-500">
            choose from folder
          </a>
        </p>
        <input {...getInputProps()} />
        {/* {isDragActive && <p>Drag is Active</p>} */}
      </div>
      {files.map((file) => (
        <p key={file.name}>{file.name}</p>
      ))}
    </>
  );
};

Upload.displayName = "Upload";
