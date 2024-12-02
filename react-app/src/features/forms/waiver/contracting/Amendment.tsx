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
import { Link } from "react-router-dom";
import { Link } from "react-router-dom";
import { getFAQLinkForAttachments } from "../../faqLinks";

interface AmendmentFormProps {
  waiverId?: string;
}

export const AmendmentForm = ({ waiverId }: AmendmentFormProps) => {
interface AmendmentFormProps {
  waiverId?: string;
}

export const AmendmentForm = ({ waiverId }: AmendmentFormProps) => {
  return (
    <ActionForm
      schema={formSchemas["contracting-amendment"]}
      title="1915(b)(4) FFS Selective Contracting Waiver Amendment Details"
      breadcrumbText="1915(b)(4) FFS Selective Contracting Waiver Amendment"
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
          {waiverId !== undefined ? (
            <div>
              <p className="font-semibold">Existing Waiver Number to Amend</p>
              <p className="text-lg font-thin" data-testid="existing-waiver-id">
                {waiverId}
              </p>
            </div>
          ) : (
            <FormField
              control={control}
              name="waiverNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold" data-testid="existing-waiver-label">
                    Existing Waiver Number to Amend <RequiredIndicator />
                  </FormLabel>
                  <p className="text-neutral-500">
                    Enter the existing waiver number you are seeking to amend in the format it was
                    approved, using a dash after the two character state abbreviation.
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
          )}
          {waiverId !== undefined ? (
            <div>
              <p className="font-semibold">Existing Waiver Number to Amend</p>
              <p className="text-lg font-thin" data-testid="existing-waiver-id">
                {waiverId}
              </p>
            </div>
          ) : (
            <FormField
              control={control}
              name="waiverNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold" data-testid="existing-waiver-label">
                    Existing Waiver Number to Amend <RequiredIndicator />
                  </FormLabel>
                  <p className="text-gray-500 font-light">
                    Enter the existing waiver number you are seeking to amend in the format it was
                    approved, using a dash after the two character state abbreviation.
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
          )}
          <FormField
            control={control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-4">
                  <FormLabel className="font-semibold" data-testid="waiverid-amendment-label">
                  <FormLabel className="font-semibold" data-testid="waiverid-amendment-label">
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
                <p className="text-neutral-500">
                  The Waiver Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For
                  amendments, the last two digits start with {"'01'"} and ascends.
                  The Waiver Number must be in the format of SS-####.R##.## or SS-#####.R##.##. For
                  amendments, the last two digits start with {"'01'"} and ascends.
                </p>
                <FormControl className="max-w-sm">
                  <Input
                    ref={field.ref}
                    value={field.value}
                    onChange={(e) => field.onChange(e.currentTarget.value.toUpperCase())}
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
                  Proposed Effective Date of 1915(b) Waiver Amendment <RequiredIndicator />
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
        faqLink: getFAQLinkForAttachments("contracting-amendment"),
      }}
      defaultValues={{ id: "", waiverNumber: waiverId ?? "" }}
      documentPollerArgs={{
        property: "id",
        documentChecker: (check) => check.recordExists,
      }}
    />
  );
};
