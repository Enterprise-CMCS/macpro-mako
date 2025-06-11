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
      breadcrumbText="Submit new CHIP eligibility SPA"
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
            name="chipSubmissionType"
            render={({ field }) => {
              const selectedValues = Array.isArray(field.value) ? field.value : [];
              return (
                <FormItem className="w-full sm:max-w-[460px]">
                  <FormLabel className="font-bold">CHIP Submission Type</FormLabel>
                  <Select>
                    <FormControl>
                      <SelectTrigger
                        showIcon={false}
                        className="relative w-full mt-2 h-[40px] px-[4px] gap-[5px] border border-[#565C65] text-gray-950 flex items-center justify-between rounded-none after:hidden"
                      >
                        <SelectValue className="truncate text-left w-full">
                          {selectedValues.length > 0 ? selectedValues.join(", ") : ""}
                        </SelectValue>
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
                    <SelectContent>
                      {chipSubmissionType.map((option) => {
                        const isSelected = selectedValues.includes(option);
                        return (
                          <div
                            key={option}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              const updated = isSelected
                                ? selectedValues.filter((val) => val !== option)
                                : [...selectedValues, option];
                              field.onChange(updated);
                            }}
                          >
                            <Checkbox checked={isSelected} />
                            <span>{option}</span>
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
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
        instructions: [
          <p data-testid="chip-attachments-instructions">
            Maximum file size of 80 MB per attachment. You can add multiple files per attachment
            type. <br /> Read the description for each of the attachment types on the{" "}
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
