import { FormSchema, DefaultFieldGroupProps } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils/regex";

const subheaderStyling = "py-3 px-8 w-full bg-gray-300 text-2xl font-bold ";
const rowStyling = "flex-row flex w-full gap-8";

export const v202401: FormSchema = {
  formId: "g2c",
  header: "Premiums and cost sharing G2c: Cost-sharing amounts—Targeting",
  subheader: "1916 | 1916A | 42 CFR 447.52 through 447.54",
  sections: [
    {
      sectionId: "overview",
      title: "Overview",
      form: [
        {
          slots: [
            {
              name: "does-state-target-specific-groups",
              label:
                "Does the state target cost sharing to a specific group or groups of individuals?",
              labelClassName: "text-black font-bold",
              rhf: "Select",
              props: {
                customSort: "noSort",
                className: "max-w-28",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              rules: { required: "* Required" },
            },
          ],
        },
      ],
    },
    {
      sectionId: "populations",
      title: "Populations",
      form: [
        {
          wrapperClassName: "-mt-6",
          slots: [
            {
              name: "pop-array",
              rhf: "FieldArray",
              props: {
                fieldArrayClassName: DefaultFieldGroupProps.fieldArrayClassName,
                appendText: "Add population",
                appendClassName: DefaultFieldGroupProps.appendClassName,
                removeText: "Remove above population",
                appendVariant: "default",
                lastDivider: "border-primary border-b-[2px]",
              },
              fields: [
                {
                  name: "pop-label",
                  rhf: "TextDisplay",
                  text: [{ type: "numberedSet", text: "Population" }],
                  formItemClassName: subheaderStyling,
                },
                {
                  name: "pop-name-opt",
                  rhf: "Input",
                  label: "Population name (optional)",
                  labelClassName: "text-black font-bold",
                  props: { className: "w-[40rem]" },
                  rules: {
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  name: "eligibile-group-list",
                  rhf: "Textarea",
                  label: "Eligibility group(s) included",
                  labelClassName: "font-bold text-black",
                  props: { className: "w-[40rem]" },
                  rules: {
                    required: "* Required",
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
                {
                  name: "income-wrapper",
                  rhf: "WrappedGroup",
                  props: { wrapperClassName: rowStyling },
                  fields: [
                    {
                      name: "inc-greater-than",
                      rhf: "Input",
                      label: "Income greater than ($)",
                      labelClassName: "text-black",
                      formItemClassName: "w-60",
                      rules: {
                        required: "* Required",
                        pattern: {
                          value: /^\d*(?:\.\d{1,2})?$/,
                          message:
                            "Must be a positive number, maximum of two decimals, no commas. e.g. 1234.56",
                        },
                      },
                    },
                    {
                      name: "inc-lesser-than",
                      rhf: "Input",
                      label: "Income less than or equal to ($)",
                      labelClassName: "text-black",
                      formItemClassName: "w-64",
                      rules: {
                        required: "* Required",
                        pattern: {
                          value: /^\d*(?:\.\d{1,2})?$/,
                          message:
                            "Must be a positive number, maximum of two decimals, no commas. e.g. 1234.56",
                        },
                      },
                    },
                  ],
                },
                {
                  name: "div-1",
                  rhf: "Divider",
                },
                {
                  name: "services",
                  rhf: "FieldArray",
                  props: {
                    appendText: "Add service",
                    fieldArrayClassName:
                      DefaultFieldGroupProps.fieldArrayClassName +
                      "divider-parent-element",
                  },
                  fields: [
                    {
                      name: "child-wrapper",
                      rhf: "WrappedGroup",
                      props: {
                        wrapperClassName:
                          "ml-[0.6rem] space-y-6 pl-6 px-4 border-l-4 border-l-primary",
                      },
                      fields: [
                        {
                          name: "serv-name",
                          rhf: "Input",
                          label: "Service",
                          labelClassName: "text-black font-bold",
                          props: { className: "w-[40rem]" },
                          rules: { required: "* Required" },
                        },
                        {
                          name: "serviceWrapper",
                          rhf: "WrappedGroup",
                          props: { wrapperClassName: rowStyling },
                          fields: [
                            {
                              name: "serv-amount",
                              rhf: "Input",
                              label: "Amount",
                              labelClassName: "text-black font-bold",
                              formItemClassName: "w-48",
                              rules: {
                                required: "* Required",
                                pattern: {
                                  value: /^\d*(?:\.\d{1,2})?$/,
                                  message:
                                    "Must be a positive number, maximum of two decimals, no commas. e.g. 1234.56",
                                },
                              },
                            },
                            {
                              rhf: "Select",
                              name: "dollar-or-percent",
                              rules: { required: "* Required" },
                              formItemClassName: "w-56",
                              labelClassName: "text-black font-bold",
                              label: "Dollars or percentage",
                              props: {
                                options: [
                                  {
                                    label: "Dollar",
                                    value: "dollar",
                                  },
                                  {
                                    label: "Percentage",
                                    value: "percentage",
                                  },
                                ],
                              },
                            },
                            {
                              rhf: "Select",
                              name: "unit",
                              rules: { required: "* Required" },
                              labelClassName: "text-black font-bold",
                              label: "Unit",
                              formItemClassName: "w-48",
                              props: {
                                customSort: "noSort",
                                options: [
                                  { label: "Day", value: "Day" },
                                  { label: "Month", value: "Month" },
                                  { label: "Visit", value: "Visit" },
                                  {
                                    label: "Prescription",
                                    value: "Prescription",
                                  },
                                  { label: "15 minute", value: "15 minute" },
                                  { label: "30 minute", value: "30 minute" },
                                  { label: "Hour", value: "Hour" },
                                  { label: "Trip", value: "Trip" },
                                  { label: "Encounter", value: "Encounter" },
                                  { label: "Pair", value: "Pair" },
                                  { label: "Item", value: "Item" },
                                  { label: "Procedure", value: "Procedure" },
                                  {
                                    label: "Entire Stay",
                                    value: "Entire Stay",
                                  },
                                  { label: "Other", value: "Other" },
                                ],
                              },
                            },
                          ],
                        },
                        {
                          name: "explanation",
                          label: "Explanation (optional)",
                          labelClassName: "text-black font-bold",
                          rhf: "Textarea",
                          rules: {
                            pattern: {
                              value: noLeadingTrailingWhitespace,
                              message:
                                "Must not have leading or trailing whitespace.",
                            },
                          },
                        },
                      ],
                    },
                    {
                      name: "div-2",
                      rhf: "Divider",
                      props: {
                        wrapperClassName: "last-child-element skinny-border",
                      },
                    },
                  ],
                },
                {
                  name: "div-2",
                  rhf: "Divider",
                },
                {
                  name: "does-state-allow-pay-cost-share-for-non-exempt",
                  label:
                    "Does the state allow providers to require individuals to pay cost sharing as a condition for receiving items or services, subject to the conditions specified at 42 CFR 447.52(e)(1)? This is only allowed for non-exempt individuals with family income above 100% of the federal poverty level (FPL).",
                  rhf: "Select",
                  labelClassName: "text-black font-bold",
                  props: {
                    className: "max-w-28",
                    options: [
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                    ],
                  },
                  rules: { required: "* Required" },
                },
                {
                  name: "div-3",
                  rhf: "Divider",
                },
                {
                  name: "non-pref-desc-bold",
                  rhf: "TextDisplay",
                  text: [
                    {
                      type: "bold",
                      text: "Cost sharing for non-preferred drugs charged to otherwise exempt individuals",
                    },
                  ],
                },
                {
                  name: "non-pref-desc-low",
                  rhf: "TextDisplay",
                  text: "If the state charges cost sharing for non-preferred drugs to specific groups of individuals (entered above), answer the following question.",
                },
                {
                  name: "does-state-charge-cost-share-non-preffered-drugs",
                  label:
                    "Does the state charge cost sharing for non-preferred drugs to otherwise exempt individuals?",
                  rhf: "Select",
                  labelClassName: "text-black font-bold",
                  props: {
                    className: "max-w-28",
                    options: [
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                    ],
                  },
                  rules: { required: "* Required" },
                },
                {
                  name: "div-4",
                  rhf: "Divider",
                },
                {
                  name: "non-emerg-desc-bold",
                  rhf: "TextDisplay",
                  text: [
                    {
                      type: "bold",
                      text: "Cost sharing for non-emergency services provided in the hospital emergency department charged to otherwise exempt individuals",
                    },
                  ],
                },
                {
                  name: "non-emerg-desc-low",
                  rhf: "TextDisplay",
                  text: "If the state charges cost sharing for non-emergency services provided in the hospital emergency department (entered above), answer the following question.",
                },
                {
                  name: "does-state-charge-non-emergency-serv",
                  label:
                    "Does the state charge cost sharing for non-emergency services provided in the hospital emergency department to otherwise exempt individuals?",
                  rhf: "Select",
                  labelClassName: "text-black font-bold",
                  props: {
                    className: "max-w-28",
                    options: [
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                    ],
                  },
                  rules: { required: "* Required" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
