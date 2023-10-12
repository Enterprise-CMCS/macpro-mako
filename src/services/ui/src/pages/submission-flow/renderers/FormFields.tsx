import {
  Calendar,
  Input,
  RequiredIndicator,
  Textarea,
} from "@/components/Inputs";
import { Handler } from "@/pages/submission-flow/renderers/FormPage";
import { ChangeEvent, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { cn } from "@/lib";
import { Calendar as CalendarIcon } from "lucide-react";

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

export const SpaIDInput = ({ handler }: { handler: Handler }) => (
  <Input
    type="text"
    id="input-spa-id"
    name="spaId"
    className="max-w-sm mt-4"
    aria-describedby="desc-spa-id"
    onChange={(event) => handler(event)}
    required
  />
);

export const EffectiveDateIntro = () => (
  <p className="text-gray-500 font-light mt-1">For example: 4/28/1986</p>
);

export const EffectiveDateField = ({ handler }: { handler: Handler }) => {
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
            setDate(date); // purely for UI purposes
            handler({
              target: {
                name: "proposedEffectiveDate",
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

export const AttachmentsFields = ({ handler }: { handler: Handler }) => <></>;

export const AdditionalInfoIntro = () => (
  <p className="text-gray-500 font-light mt-1">
    Add anything else that you would like to share with CMS.
  </p>
);

export const AdditionalInfoInput = ({ handler }: { handler: Handler }) => {
  const [len, setLen] = useState(0);
  return (
    <>
      <Textarea
        aria-invalid="false"
        aria-describedby="character-count"
        name="additionalInformation"
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
