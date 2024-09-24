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
import { ActionForm } from "@/components/ActionForm";
import { formSchemas } from "@/formSchemas";

export const MedicaidForm = () => (
  <ActionForm
    schema={formSchemas["new-medicaid-submission"]}
    title="Medicaid SPA Details"
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
      faqLink: "/faq/medicaid-spa-attachments",
      specialInstructions:
        "Maximum file size of 80 MB per attachment. You can add multiple files per attachment type except for the CMS Form 179.",
    }}
    documentPollerArgs={{
      property: "id",
      documentChecker: (check) => check.recordExists,
    }}
    tab={"spas"}
  />
);
