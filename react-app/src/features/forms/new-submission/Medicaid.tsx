import { Link } from "react-router-dom";
import {
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  RequiredIndicator,
  DatePicker,
  FormMessage,
  Input,
  FAQ_TAB,
  SpaIdFormattingDesc,
} from "@/components";
import { newMedicaidSubmission } from "shared-types";
import { ActionForm } from "@/components/ActionForm";

export const MedicaidForm = () => (
  <ActionForm
    schema={newMedicaidSubmission.feSchema}
    title="Medicaid SPA Details"
    fields={({ control }) => (
      <>
        <FormField
          control={control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                <FormLabel className="font-semibold">
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
                  className="max-w-sm"
                  ref={field.ref}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(e.currentTarget.value.toUpperCase())
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="proposedEffectiveDate"
          render={({ field }) => (
            <FormItem className="max-w-md">
              <FormLabel className="text-lg font-semibold block">
                Proposed Effective Date of Medicaid SPA <RequiredIndicator />
              </FormLabel>
              <FormControl>
                <DatePicker
                  onChange={(date) => field.onChange(date.getTime())}
                  date={field.value ? new Date(field.value) : undefined}
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
      faqLink: "/faq/medicaid-spa-attachments",
      specialInstructions:
        "Maximum file size of 80 MB per attachment. You can add multiple files per attachment type except for the CMS Form 179.",
    }}
    documentPollerArgs={{
      property: "id",
      documentChecker: (check) => check.recordExists,
    }}
    promptOnLeavingForm={{
      header: "Stop form submission?",
      body: "All information you've entered on this form will be lost if you leave this page.",
      acceptButtonText: "Yes, leave form",
      cancelButtonText: "Return to form",
      areButtonsReversed: true,
    }}
  />
);
