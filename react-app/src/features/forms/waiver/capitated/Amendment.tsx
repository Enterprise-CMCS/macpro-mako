import {
  ActionForm,
  DatePicker,
  FAQ_TAB,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
} from "@/components";
import { Link } from "react-router-dom";
import { formSchemas } from "@/formSchemas";

export const AmendmentForm = () => (
  <ActionForm
    schema={formSchemas["capitated-amendment"]}
    title="1915(b) Comprehensive (Capitated) Waiver Amendment Details"
    breadcrumbText="1915(b) Comprehensive (Capitated) Waiver Amendment"
    tabToRedirectTo="waivers"
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
              <FormLabel
                className="font-semibold"
                data-testid="existing-waiver-label"
              >
                Existing Waiver Number to Amend <RequiredIndicator />
              </FormLabel>
              <p className="text-gray-500 font-light">
                Enter the existing waiver number you are seeking to amend in the
                format it was approved, using a dash after the two character
                state abbreviation.
              </p>
              <FormControl className="max-w-sm">
                <Input
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
          name="id"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                <FormLabel
                  className="font-semibold"
                  data-testid="1915b-waiver-amendment-label"
                >
                  1915(b) Waiver Amendment Number <RequiredIndicator />
                </FormLabel>
                <Link
                  to="/faq/waiver-amendment-id-format"
                  target={FAQ_TAB}
                  rel="noopener noreferrer"
                  className="text-blue-900 underline"
                >
                  What is my 1915(b) Waiver Amendment Number?
                </Link>
              </div>
              <p className="text-gray-500 font-light">
                The Waiver Number must be in the format of SS-####.R##.## or
                SS-#####.R##.##. For amendments, the last two digits start with{" "}
                {"'01'"} and ascends.
              </p>
              <FormControl className="max-w-sm">
                <Input
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
            <FormItem className="max-w-lg">
              <FormLabel className="text-lg font-semibold block">
                Proposed Effective Date of 1915(b) Waiver Amendment{" "}
                <RequiredIndicator />
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
      faqLink: "/faq/waiverb-attachments",
    }}
    defaultValues={{ id: "" }}
    documentPollerArgs={{
      property: "id",
      documentChecker: (check) => check.recordExists,
    }}
  />
);
