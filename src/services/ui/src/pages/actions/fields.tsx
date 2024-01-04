import * as I from "@/components/Inputs";
import React from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

export const renderAdditionalInfo = (
  field: ControllerRenderProps<FieldValues, string | any>,
  required = false,
  description: string
) => (
  <I.FormItem className="mt-8">
    <h3 className="font-bold text-2xl font-sans">
      Additional Information {required ? <I.RequiredIndicator /> : null}
    </h3>
    <I.FormLabel className="font-normal">
      {description}
      <br />
      <p>
        <em className="italic">
          Once you submit this form, a confirmation email is sent to you and to
          CMS. CMS will use this content to review your package. If CMS needs
          any additional information, they will follow up by email.
        </em>{" "}
      </p>
      <br />
    </I.FormLabel>
    <I.Textarea {...field} className="h-[200px] resize-none" />
    <I.FormDescription>4,000 characters allowed</I.FormDescription>
  </I.FormItem>
);

export const renderFileUpload = (
  field: ControllerRenderProps<FieldValues, string | any>,
  required = false,
  label: string
) => (
  <I.FormItem className="mt-8">
    <I.FormLabel>
      {label}
      {required ? <I.RequiredIndicator /> : null}
    </I.FormLabel>
    <I.Upload files={field?.value ?? []} setFiles={field.onChange} />
    <I.FormMessage />
  </I.FormItem>
);
