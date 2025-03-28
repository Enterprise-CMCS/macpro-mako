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
import { FAQ_TAB } from "@/consts";
import { formSchemas } from "@/formSchemas";

import { getFAQLinkForAttachments } from "../faqLinks";

export const ChipForm = () => (
  <ActionForm
    title="CHIP SPA Details"
    schema={formSchemas["new-chip-submission"]}
    breadcrumbText="Submit new CHIP SPA"
    fields={({ control }) => (
      <>
        <FormField
          control={control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                <FormLabel className="font-semibold" data-testid="spaid-label">
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
                  onChange={(e) => field.onChange(e.currentTarget.value.toUpperCase())}
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
                  dataTestId="proposedEffectiveDate"
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
      faqLink: getFAQLinkForAttachments("new-chip-submission"),
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
