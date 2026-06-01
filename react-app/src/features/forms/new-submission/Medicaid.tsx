import { Link } from "react-router";

import {
  ActionForm,
  DatePicker,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
  SpaIdFormattingDesc,
} from "@/components";
import { AttachmentFileFormatInstructions } from "@/components/ActionForm/actionForm.components";
import { FAQ_TAB } from "@/consts";
import { formSchemas } from "@/formSchemas";

import { NEW_SUBMISSION_FORM_DESCRIPTION, NEW_SUBMISSION_PROGRESS_LOSS_REMINDER } from "./content";

export const MedicaidForm = () => {
  return (
    <ActionForm
      schema={formSchemas["new-medicaid-submission"]}
      title="Medicaid SPA Details"
      breadcrumbText="Submit new Medicaid SPA"
      formDescription={NEW_SUBMISSION_FORM_DESCRIPTION}
      formDescriptionProgressLossReminder={NEW_SUBMISSION_PROGRESS_LOSS_REMINDER}
      fields={({ control }) => (
        <>
          <FormField
            control={control}
            name="id"
            render={({ field }) => {
              return (
                <FormItem>
                  <div className="flex gap-4">
                    <FormLabel htmlFor="spa-id" className="font-semibold" data-testid="spaid-label">
                      SPA ID <RequiredIndicator />
                    </FormLabel>
                    <Link
                      to="/faq/spa-id-format"
                      target={FAQ_TAB}
                      rel="noopener noreferrer"
                      className="text-blue-900 underline"
                    >
                      What is my SPA ID?
                    </Link>
                  </div>
                  <SpaIdFormattingDesc />
                  <FormControl>
                    <Input
                      id="spa-id"
                      className="max-w-sm"
                      ref={field.ref}
                      value={field.value}
                      aria-describedby="spa-id-formatting-desc"
                      onChange={(e) => field.onChange(e.currentTarget.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage announceOn={field.value} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={control}
            name="proposedEffectiveDate"
            render={({ field }) => (
              <FormItem className="max-w-md">
                <FormLabel
                  className="text-lg font-semibold block"
                  data-testid="proposedEffectiveDate-label"
                >
                  Proposed Effective Date of Medicaid SPA <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <DatePicker
                    onChange={(date) => field.onChange(date.getTime())}
                    date={field.value ? new Date(field.value) : undefined}
                    dataTestId="proposedEffectiveDate"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      defaultValues={{ id: "" }}
      attachments={{
        instructions: [
          <p data-testid="attachments-instructions">
            Maximum file size of 80 MB per attachment.{" "}
            <span className="font-bold">
              You can add multiple files per attachment type except for the CMS-179 Form.
            </span>{" "}
            Read the description for each of the attachment types on the{" "}
            <Link
              to="/faq/medicaid-spa-attachments"
              target={FAQ_TAB}
              rel="noopener noreferrer"
              className="text-blue-900 underline"
            >
              FAQ Page
            </Link>
            .
          </p>,
          <AttachmentFileFormatInstructions />,
        ],
      }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
      draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
    />
  );
};
