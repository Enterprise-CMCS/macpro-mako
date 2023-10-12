import {
  Calendar,
  Input,
  RequiredIndicator,
  Textarea,
} from "@/components/Inputs";
import { Handler } from "@/pages/submission-flow/renderers/FormPage";
import { ChangeEvent, useCallback, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { cn } from "@/lib";
import { Calendar as CalendarIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { AttachmentRequirement } from "@/pages/submission-flow/config/forms/medicaid-spa-config";

export const FormIntro = () => (
  <p className="my-3">
    Once you submit this form, a confirmation email is sent to you and to CMS.
    CMS will use this content to review your package, and you will not be able
    to edit this form. If CMS needs any additional information, they will follow
    up by email.{" "}
    <b>If you leave this page, you will lose your progress on this form.</b>
  </p>
);

export const SpaIDIntro = () => (
  <p id="desc-spa-id" className="text-gray-500 font-light">
    Must follow the format SS-YY-NNNN or SS-YY-NNNN-xxxx.
    <br />
    <em>
      Reminder - CMS recommends that all SPA numbers start with the year in
      which the package is submitted.
    </em>
  </p>
);

export const SpaIDInput = ({
  handler,
  fieldName,
}: {
  handler: Handler;
  fieldName: string;
}) => (
  <Input
    type="text"
    id="input-spa-id"
    name={fieldName}
    className="max-w-sm mt-4"
    aria-describedby="desc-spa-id"
    onChange={(event) => handler(event)}
    required
  />
);

export const EffectiveDateIntro = () => (
  <p className="text-gray-500 font-light mt-1">For example: 4/28/1986</p>
);

/** This borrows a lot from {@link FilterableDateRange} and commonalities can later
 * be extracted for more concise code */
export const EffectiveDateField = ({
  handler,
  fieldName,
}: {
  handler: Handler;
  fieldName: string;
}) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const handleClose = (updateOpen: boolean) => {
    setOpen(updateOpen);
  };
  const today = new Date();
  return (
    <Popover open={open} onOpenChange={handleClose}>
      <PopoverTrigger>
        <div
          id="date"
          className={cn(
            "flex items-center w-[270px] border border-input rounded-md p-2 mt-4 justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toDateString() : "Select a date"}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          disabled={[{ before: today }]}
          initialFocus
          mode="single"
          defaultMonth={today}
          selected={date}
          numberOfMonths={1}
          className="bg-white"
          onSelect={(date) => {
            // purely for UI purposes
            setDate(date);
            // updates the actual form state object
            handler({
              target: {
                name: fieldName,
                value: date,
              },
            } as ChangeEvent<any>);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export const AttachmentsIntro = () => (
  <>
    <p className="mt-1 mb-4">
      Maximum file size of 80 MB per attachment. You can add multiple files per
      attachment type. Read the description for each of the attachment types on
      the FAQ Page.
    </p>
    <p className="my-4">
      We accept the following file formats:{" "}
      <b>.docx, .jpg, .pdf, .png, .xlsx</b>. See the full list on the FAQ Page.
    </p>
    <p className="my-4">
      <RequiredIndicator /> At least one attachment is required.
    </p>
  </>
);

export const AttachmentsFields = ({
  handler,
  attachmentsConfig,
}: {
  handler: Handler;
  attachmentsConfig: AttachmentRequirement[];
}) => {
  /* The template for a drag-n-drop upload section */
  const DropZone = ({ multiple }: { multiple: boolean }) => {
    const [fileNames, setFileNames] = useState<string[]>([]);
    const onDrop = useCallback((acceptedFiles: File[]) => {
      // Do something with the files
      console.log(acceptedFiles);
      setFileNames((prevState) => [
        ...prevState,
        ...acceptedFiles.map((file) => file.name),
      ]);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
    });

    return (
      <div
        {...getRootProps()}
        className="border border-dashed rounded-md h-20 p-4 flex justify-center align-middle"
      >
        <input {...getInputProps()} multiple={multiple} />
        {fileNames.length ? (
          /* TODO: Currently no guidance on how to display files when loaded. Should
           *   get HCD's opinion */
          <p className="my-auto">{fileNames.join(", ")}</p>
        ) : isDragActive ? (
          /* Only shows when file drag is happening */
          <p className="my-auto">Drop the files here ...</p>
        ) : (
          <p className="my-auto">
            Drag file here or{" "}
            <span className="text-sky-600 underline hover:cursor-pointer">
              {/* The whole DropZone is clickable, so this is just a fun little
                 not-a-link link to make this look clickable per the Figma */}
              choose from folder
            </span>
          </p>
        )}
      </div>
    );
  };
  return (
    <section>
      {attachmentsConfig.map((req, idx) => (
        <div key={`${req.label}- ${idx}`}>
          <label>
            <span className="font-bold text-sm">{req.label}</span>
            {req.required ? <RequiredIndicator /> : null}
          </label>
          <DropZone multiple={req.multiple} />
          {/* Does not show under final dropzone */}
          {idx !== attachmentsConfig.length - 1 ? (
            <hr className="my-6" />
          ) : null}
        </div>
      ))}
    </section>
  );
};

export const AdditionalInfoIntro = () => (
  <p className="text-gray-500 font-light mt-1">
    Add anything else that you would like to share with CMS.
  </p>
);

export const AdditionalInfoInput = ({
  handler,
  fieldName,
}: {
  handler: Handler;
  fieldName: string;
}) => {
  const [len, setLen] = useState(0);
  return (
    <>
      <Textarea
        aria-invalid="false"
        aria-describedby="character-count"
        name={fieldName}
        maxLength={4000}
        aria-live="off"
        aria-multiline="true"
        id="additional-information"
        className="h-[300px] mt-4"
        onChange={(event) => {
          handler(event);
          setLen(event.target.value.length);
        }}
      />
      <span
        tabIndex={0}
        id="character-count"
        aria-label="character-count"
        aria-live="polite"
        className="text-gray-500 font-light"
      >
        {`${4000 - len} characters remaining`}
      </span>
    </>
  );
};
