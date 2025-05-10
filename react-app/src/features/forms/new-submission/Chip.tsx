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
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import { getFAQLinkForAttachments } from "../faqLinks";

export const ChipFormWrapper = () => {
  const useEligibilityForm = useFeatureFlag("CHIP_SPA_SUBMISSION");

  const schemaKey = useEligibilityForm ? "new-chip-eligibility-submission" : "new-chip-submission";

  const schema = formSchemas[schemaKey];
  const faqEventKey = useEligibilityForm
    ? "new-chip-eligibility-submission"
    : "new-chip-submission";

  const title = useEligibilityForm ? "CHIP Eligibility SPA Details" : "CHIP SPA Details";

  const breadcrumb = useEligibilityForm ? "Submit new CHIP eligibility SPA" : "Submit new CHIP SPA";

  return (
    <ActionForm
      title={title}
      schema={schema}
      breadcrumbText={breadcrumb}
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
        faqLink: getFAQLinkForAttachments(faqEventKey),
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
};
