import {
  Calendar,
  Input,
  RequiredIndicator,
  Textarea,
} from "@/components/Inputs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { cn } from "@/lib";
import { Calendar as CalendarIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { FormFieldName } from "@/consts/forms";
import { SpaSubmissionBody } from "@/api/submit";

type FieldArgs<T = NonNullable<unknown>> = {
  handler: Dispatch<SetStateAction<SpaSubmissionBody>>;
  name: FormFieldName;
} & T;

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

export const EffectiveDateIntro = () => (
  <p className="text-gray-500 font-light mt-1">For example: 4/28/1986</p>
);

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

export const AdditionalInfoIntro = () => (
  <p className="text-gray-500 font-light mt-1">
    Add anything else that you would like to share with CMS.
  </p>
);

export const SpaIDInput = ({ handler, name }: FieldArgs) => (
  <Input
    type="text"
    id="input-spa-id"
    name={name}
    className="max-w-sm mt-4"
    aria-describedby="desc-spa-id"
    onChange={(event) =>
      handler((prev) => ({
        ...prev,
        [name]: event.target.value,
      }))
    }
    required
  />
);

/** This borrows a lot from {@link FilterableDateRange} and commonalities can later
 * be extracted for more concise code */
export const SingleDateField = ({ handler, name }: FieldArgs) => {
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
            handler((prev) => ({
              ...prev,
              [name]: date?.getTime() || undefined,
            }));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

/* Attachment information necessary for rendering fields */
export type AttachmentFieldOption = {
  label: string;
  required: boolean;
  multiple: boolean;
};
export const AttachmentsFields = ({
  handler,
  name,
  attachmentsConfig,
}: FieldArgs<{
  attachmentsConfig: AttachmentFieldOption[];
}>) => {
  // Used for UI inside dropzone when files are added
  const [allZoneFilenames, setAllZoneFilenames] = useState<
    { forField: string; fileName: string }[]
  >([]);
  // Common constructor for attachment field id/name attributes
  const fieldName = (label: string) => `${name}-${label}`;
  // The template for a drag-n-drop upload section
  const DropZone = ({ label, multiple, required }: AttachmentFieldOption) => {
    // Getting names of files in this dropzone for UI
    const fileNamesInZone = useMemo(
      () =>
        allZoneFilenames
          .filter((v) => v.forField === label)
          .map((v) => v.fileName),
      [allZoneFilenames, label]
    );
    const onDrop = useCallback((acceptedFiles: File[]) => {
      console.log(acceptedFiles);
      // Update filenames state
      setAllZoneFilenames((prevState) => [
        ...acceptedFiles.map((file) => ({
          fileName: file.name,
          forField: label,
        })),
        ...prevState,
      ]);
      // Pass the file into the form data state
      // TODO: Do we need any meta for which files map to which document upload
      //  requirement?
      handler((prev: SpaSubmissionBody) => ({
        ...prev,
        [name]: [...prev.attachments, ...acceptedFiles],
      }));
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple, // Set here instead of `input` attributes
      maxSize: 80 * 1000000, // 80mb max per attachment
      //TODO: Limit accepted filetypes
    });

    return (
      <div
        {...getRootProps()}
        className="border border-dashed rounded-md h-20 p-4 flex justify-center align-middle"
      >
        <input
          {...getInputProps({
            /* Plug additional `input` props in here so they
             * are not overridden */
            // required: required, // TODO: working TOO well? won't submit even with requirement filled
            name: fieldName(label),
            id: fieldName(label),
          })}
        />
        {fileNamesInZone.length ? (
          /* TODO: Later to be replaced with HCD designs; were not present
           *   upon starting this work. */
          /* Shows when a file is presently selected for upload */
          <p className="my-auto">{fileNamesInZone.join(", ")}</p>
        ) : isDragActive ? (
          /* Only shows when file drag is happening */
          <p className="my-auto">Drop the files here ...</p>
        ) : (
          /* The whole DropZone is clickable, so this is just a fun little
           * not-a-link link to make this look clickable per the Figma */
          <p className="my-auto">
            Drag file here or{" "}
            <span className="text-sky-600 underline hover:cursor-pointer">
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
          <label htmlFor={fieldName(req.label)}>
            <span className="font-bold text-sm">{req.label}</span>
            {req.required ? <RequiredIndicator /> : null}
          </label>
          <DropZone {...req} />
          {/* Does not show under final dropzone */}
          {idx !== attachmentsConfig.length - 1 ? (
            <hr className="my-6" />
          ) : null}
        </div>
      ))}
    </section>
  );
};

export const AdditionalInfoInput = ({ handler, name }: FieldArgs) => {
  const [len, setLen] = useState(0);
  return (
    <>
      <Textarea
        aria-invalid="false"
        aria-describedby="character-count"
        name={name}
        maxLength={4000}
        aria-live="off"
        aria-multiline="true"
        id="additional-information"
        className="h-[300px] mt-4"
        onChange={(event) => {
          handler((prev) => ({
            ...prev,
            [name]: event.target.value,
          }));
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
