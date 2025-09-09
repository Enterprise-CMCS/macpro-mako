import { Link } from "react-router";

import {
  ActionForm,
  Checkbox,
  DatePicker,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SpaIdFormattingDesc,
} from "@/components";
import { FAQ_TAB } from "@/consts";
import { formSchemas } from "@/formSchemas";

export const ChipDetailsForm = () => {
  const chipSubmissionType = [
    "MAGI Eligibility and Methods",
    "Non-Financial Eligibility",
    "XXI Medicaid Expansion",
    "Eligibility Process",
  ];

  return (
    <ActionForm
      title="CHIP Eligibility SPA Details"
      schema={formSchemas["new-chip-details-submission"]}
      breadcrumbText="Submit new CHIP Eligibility SPA"
      fields={({ control }) => (
        <>
          <FormField
            control={control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-4">
                  <FormLabel htmlFor="spa-id" className="font-semibold" data-testid="spaid-label">
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
                    id="spa-id"
                    className="max-w-sm"
                    ref={field.ref}
                    value={field.value}
                    aria-describedby="spa-id-formatting-desc"
                    onChange={(e) => field.onChange(e.currentTarget.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage announceOn={field.value} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="chipSubmissionType"
            data-testid="HERE"
            render={({ field }) => {
              const selectedValues = Array.isArray(field.value) ? field.value : [];
              return (
                <FormItem className="w-full sm:max-w-[460px] relative">
                  <FormLabel className="font-bold">CHIP Submission Type</FormLabel>
                  <Select>
                    <FormControl>
                      <SelectTrigger
                        showIcon={false}
                        className="relative w-full mt-2 h-[40px] px-[4px] gap-[5px] border border-[#565C65] text-gray-950 flex items-center justify-between rounded-none after:hidden"
                      >
                        <div className="flex-1 text-left overflow-hidden">
                          <SelectValue
                            data-testid="selected-value-chip"
                            className="truncate w-full whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            {selectedValues.length > 0 ? selectedValues.join(", ") : ""}
                          </SelectValue>
                        </div>

                        <div className="flex items-center pl-2 pr-3 h-full border-l border-slate-300">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="#565C65"
                            strokeWidth={3}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className=" left-0 top-full mt-1 z-50 w-full bg-white border border-gray-200 shadow-md rounded-md">
                      {chipSubmissionType.map((option) => {
                        const isSelected = selectedValues.includes(option);
                        return (
                          <div
                            data-testid={option.replace(/ /g, "-").toLowerCase()}
                            key={option}
                            className="flex text-left gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              const updated = isSelected
                                ? selectedValues.filter((val) => val !== option)
                                : [...selectedValues, option];
                              field.onChange(updated);
                            }}
                          >
                            <Checkbox id={option.replaceAll(" ", "")} checked={isSelected} />
                            <span>{option}</span>
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormItem>
              );
            }}
          />
          <FormField
            control={control}
            name="proposedEffectiveDate"
            render={({ field }) => (
              <FormItem className="max-w-sm">
                <FormLabel className="text-lg font-semibold whitespace-nowrap block">
                  Proposed Effective Date of CHIP Eligibility SPA <RequiredIndicator />
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
        instructions: [
          <p data-testid="chip-attachments-instructions">
            Maximum file size of 80 MB per attachment. You can add multiple files per attachment
            type. Read the description for each of the attachment types on the{" "}
            <Link
              to="/faq/chip-spa-attachments"
              target={FAQ_TAB}
              rel="noopener noreferrer"
              className="text-blue-900 underline"
            >
              FAQ Page
            </Link>
            .
          </p>,
          <p data-testid="accepted-files">
            We accept the following file formats:{" "}
            <span className="font-bold">.doc, .docx, .pdf, .jpg, .odp, and more. </span>{" "}
            <Link
              to={"/faq/acceptable-file-formats"}
              target={FAQ_TAB}
              rel="noopener noreferrer"
              className="text-blue-900 underline"
            >
              See the full list
            </Link>
            .
          </p>,
          <p data-testid="chip-attachments-instructions">
            View all{" "}
            <Link
              to="/faq/chip-spa-templates"
              target={FAQ_TAB}
              rel="noopener noreferrer"
              className="text-blue-900 underline"
            >
              CHIP eligibility SPA templates and implementation guides
            </Link>
            .
          </p>,
        ],
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
