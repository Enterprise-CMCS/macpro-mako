import { Link } from "react-router";
import { SEATOOL_STATUS } from "shared-types";

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

import { getFAQLinkForAttachments } from "../../faqLinks";

export const InitialForm = () => (
  <ActionForm
    schema={formSchemas["capitated-initial"]}
    title="1915(b) Comprehensive (Capitated) Initial Waiver Details"
    breadcrumbText="1915(b) Comprehensive (Capitated) Initial Waiver"
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
          name="id"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                <FormLabel
                  className="text-lg font-semibold mr-1"
                  data-testid="1915b-waiver-initial-label"
                >
                  Initial Waiver Number <RequiredIndicator />
                </FormLabel>
                <Link
                  to={"/faq/initial-waiver-id-format"}
                  target={FAQ_TAB}
                  rel="noopener noreferrer"
                  className="text-blue-900 underline"
                >
                  What is my Initial Waiver Number?
                </Link>
              </div>
              <p className="text-neutral-500" id="waiver-number-format">
                Must be a new initial number with the format SS-####.R00.00 or SS-#####.R00.00
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
              <FormLabel className="text-lg font-semibold block">
                Proposed Effective Date of 1915(b) Initial Waiver <RequiredIndicator />
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
      faqLink: getFAQLinkForAttachments("capitated-initial"),
    }}
    defaultValues={{ id: "" }}
    documentPollerArgs={{
      property: "id",
      documentChecker: (check) => check.recordExists && check.hasStatus(SEATOOL_STATUS.SUBMITTED),
    }}
  />
);
