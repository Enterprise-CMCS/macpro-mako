import {
  ActionForm,
  DatePicker,
  FAQ_TAB,
  FormControl,
  FormField,
  FormIntroText,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredIndicator,
  Textarea,
} from "@/components";
import {
  SlotStateSelect,
  WaiverIdFieldArray,
} from "@/features/submission/app-k/slots";
import { Link } from "react-router-dom";
import { Authority, appkSchema } from "shared-types";

export const AppKAmendmentForm = () => (
  <ActionForm
    title="1915(c) Appendix K Amendment Request Details"
    schema={appkSchema}
    fields={(form) => {
      const state = form.watch("state");

      return (
        <>
          <div>
            <FormIntroText />
            <p className="max-w-4xl mt-4 text-gray-700 font-light">
              <span className="font-bold">
                If your Appendix K submission is for more than one waiver
                number, please enter one of the applicable waiver numbers. You
                do not need to create multiple submissions.
              </span>
            </p>
          </div>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-[280px]">
                <FormLabel className="font-bold" htmlFor="amendment-title">
                  Amendment Title <RequiredIndicator />
                </FormLabel>
                <Textarea
                  {...field}
                  className="h-[80px]"
                  id="amendment-title"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col">
            <FormLabel className="font-semibold" htmlFor="1975c">
              Waiver Authority
            </FormLabel>
            <span className="text-lg font-thin" id="1975c">
              1915(c)
            </span>
          </div>
          <FormField
            control={form.control}
            name="state"
            render={SlotStateSelect({
              label: (
                <>
                  State <RequiredIndicator />
                </>
              ),
            })}
          />
          {state && (
            <>
              <p>
                <div className="flex gap-4">
                  <FormLabel className="font-bold">
                    Waiver IDs <RequiredIndicator />
                  </FormLabel>
                  <Link
                    to="/faq/waiver-c-id"
                    target={FAQ_TAB}
                    rel="noopener noreferrer"
                    className="text-blue-900 underline"
                  >
                    What is my Appendix K ID?
                  </Link>
                </div>
                <div className="my-1">
                  Format is <strong>1111</strong>.<strong>R22</strong>.
                  <strong>33</strong> or <strong>11111</strong>.
                  <strong>R22</strong>.<strong>33</strong> where:
                </div>
                <ul className="pl-4 list-disc w-[600px] flex flex-col gap-1">
                  <li>
                    <strong>1111</strong> or <strong>11111</strong> is the four-
                    or five-digit waiver initial number
                  </li>
                  <li>
                    <strong>R22</strong> is the renewal number (Use{" "}
                    <strong>R00</strong> for waivers without renewals.)
                  </li>
                  <li>
                    <strong>33</strong> is the Appendix K amendment number (The
                    last two digits relating to the number of amendments in the
                    waiver cycle start with “01” and ascend.)
                  </li>
                </ul>
              </p>
              <div className="flex flex-col gap-2">
                <WaiverIdFieldArray state={state} name="waiverIds" {...form} />
              </div>
            </>
          )}
          <FormField
            control={form.control}
            name="proposedEffectiveDate"
            render={({ field }) => (
              <FormItem className="max-w-sm">
                <FormLabel className="font-bold block">
                  Proposed Effective Date of 1915(c) Appendix K Amendment{" "}
                  <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <DatePicker onChange={field.onChange} date={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }}
    defaultValues={{ waiverIds: [], title: "" }}
    documentPollerArgs={{
      property: (data) => `${data.state}-${data.waiverIds[0]}`,
      documentChecker: (checks) =>
        checks.authorityIs([Authority["1915c"]]) && checks.actionIs("Amend"),
    }}
    attachments={{
      faqLink: "/faq/appk-attachments",
    }}
  />
);
