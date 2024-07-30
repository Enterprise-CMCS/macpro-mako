import { FormSchema, DefaultFieldGroupProps } from "shared-types";

const subheaderStyling =
  "py-3 px-8 w-full bg-gray-300 text-2xl font-bold -mx-8";

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
              rhf: "Select",
              props: {
                customSort: "noSort",
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
          slots: [
            {
              name: "pop-array",
              rhf: "FieldArray",
              props: {
                fieldArrayClassName: DefaultFieldGroupProps.fieldArrayClassName,
                appendText: "Add population",
                removeText: "Remove above population",
                appendVariant: "default",
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
                },
                {
                  name: "eligibile-group-list",
                  rhf: "Textarea",
                  label: "Eligibility group(s) included",
                  rules: { required: "* Required" },
                },
                {
                  name: "income-wrapper",
                  rhf: "WrappedGroup",
                  props: { wrapperClassName: "flex-row" },
                  fields: [
                    {
                      name: "inc-greater-than",
                      rhf: "Input",
                      label: "Income greater than",
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
                      label: "Income less than or equal to",
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
                    divider: true,
                    fieldArrayClassName:
                      DefaultFieldGroupProps.fieldArrayClassName +
                      "ml-[0.6rem] mt-4 pl-6 px-4 space-y-6 border-l-4 border-l-primary",
                  },
                  fields: [
                    {
                      name: "serv-name",
                      rhf: "Input",
                      label: "Service",
                      rules: { required: "* Required" },
                    },
                    {
                      name: "serviceWrapper",
                      rhf: "WrappedGroup",
                      props: { wrapperClassName: "flex-row" },
                      fields: [
                        {
                          name: "serv-amount",
                          rhf: "Input",
                          label: "Amount",
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
                              { label: "Prescription", value: "Prescription" },
                              { label: "15 minute", value: "15 minute" },
                              { label: "30 minute", value: "30 minute" },
                              { label: "Hour", value: "Hour" },
                              { label: "Trip", value: "Trip" },
                              { label: "Encounter", value: "Encounter" },
                              { label: "Pair", value: "Pair" },
                              { label: "Item", value: "Item" },
                              { label: "Procedure", value: "Procedure" },
                              { label: "Entire Stay", value: "Entire Stay" },
                              { label: "Other", value: "Other" },
                            ],
                          },
                        },
                      ],
                    },
                    {
                      name: "explanation",
                      label: "Explanation (optional)",
                      rhf: "Textarea",
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
                  props: {
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
                  props: {
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
                  props: {
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
