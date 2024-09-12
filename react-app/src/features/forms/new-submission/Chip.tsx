import {
  ActionForm,
  FAQ_TAB,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredIndicator,
  SpaIdFormattingDesc,
  Input,
  DatePicker,
} from "@/components";
import { Link } from "react-router-dom";
import { events } from "@/events";

export const ChipForm = () => (
  <ActionForm
    title="CHIP SPA Details"
    schema={events["new-chip-submission"].formSchema}
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
            <FormItem className="max-w-sm">
              <FormLabel className="text-lg font-semibold block">
                Proposed Effective Date of CHIP SPA <RequiredIndicator />
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
      faqLink: "/faq/chip-spa-attachments",
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
