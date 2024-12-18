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
} from "@/components";
import { formSchemas } from "@/formSchemas";
import { FAQ_TAB } from "@/router";
import { Link } from "react-router";
import { getFAQLinkForAttachments } from "../../faqLinks";

export const Renewal = () => (
  <ActionForm
    schema={formSchemas["capitated-renewal"]}
    title="1915(b) Comprehensive (Capitated) Renewal Waiver Details"
    breadcrumbText="1915(b) Comprehensive (Capitated) Renewal Waiver"
    fields={({ control }) => (
      <>
        <div className="flex flex-col">
          <FormLabel className="font-semibold" htmlFor="1975b">
            Waiver Authority
          </FormLabel>
          <span className="text-lg font-thin" id="1975b">
            1915(b)
          </span>
        </div>
        <FormField
          control={control}
          name="waiverNumber"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                <FormLabel className="font-semibold" data-testid="existing-waiver-label">
                  Existing Waiver Number to Renew <RequiredIndicator />
                </FormLabel>
              </div>
              <p className="text-neutral-500">
                Enter the existing waiver number in the format it was approved, using a dash after
                the two character state abbreviation.
              </p>
              <FormControl className="max-w-sm">
                <Input
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
          name="id"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                <FormLabel className="font-semibold" data-testid="1915b-waiver-renewal-label">
                  1915(b) Waiver Renewal Number <RequiredIndicator />
                </FormLabel>
                <Link
                  to="/faq/waiver-renewal-id-format"
                  target={FAQ_TAB}
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline flex items-center"
                >
                  What is my 1915(b) Waiver Renewal Number?
                </Link>
              </div>
              <p className="text-neutral-500">
                The Waiver Number must be in the format of SS-####.R##.00 or SS-#####.R##.00. For
                renewals, the {"'R##'"} starts with {" 'R01'"} and ascends.
              </p>
              <FormControl className="max-w-sm">
                <Input
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
            <FormItem className="max-w-lg">
              <FormLabel className="font-semibold block">
                Proposed Effective Date of 1915(b) Waiver Renewal <RequiredIndicator />
              </FormLabel>
              <FormControl className="max-w-sm">
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
    attachments={{
      faqLink: getFAQLinkForAttachments("capitated-renewal"),
    }}
    defaultValues={{ id: "" }}
    documentPollerArgs={{
      property: "id",
      documentChecker: (check) => check.recordExists,
    }}
  />
);
