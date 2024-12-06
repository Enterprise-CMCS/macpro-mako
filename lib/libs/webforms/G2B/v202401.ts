import { FormSchema, DefaultFieldGroupProps } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils/regex";

export const v202401: FormSchema = {
  header: "Premiums and cost sharing G2b: Cost-sharing amounts—Medically needy individuals",
  subheader: "1916 | 1916A | 42 CFR 447.52 through 447.54",
  formId: "g2b",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              name: "state-charge-cost-sharing",
              rhf: "Select",
              rules: { required: "* Required" },
              label: "Does the state charge cost sharing to all medically needy individuals?",
              labelClassName: "font-bold text-[#212121]",
              props: {
                className: "w-[125px]",
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ],
              },
            },
            {
              name: "cost-share-same-charge-as-needy",
              rhf: "Select",
              rules: { required: "* Required" },
              label:
                "Is the cost sharing charged to medically needy individuals the same as that charged to categorically needy individuals?",
              labelClassName: "font-bold text-[#212121]",
              props: {
                className: "w-[125px]",
                options: [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      title: "Services or items with the same cost-sharing amount for all incomes",
      sectionId: "services-same-all-incomes",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "FieldArray",
              name: "service-item",
              props: {
                ...DefaultFieldGroupProps,
                appendText: "Add service or item",
                removeText: "Remove",
              },
              fields: [
                {
                  rhf: "Input",
                  name: "service-item-name",
                  rules: { required: "* Required" },
                  props: { className: "w-96" },
                  labelClassName: "text-black font-bold",
                  label: "Service or Item",
                },
                {
                  rhf: "WrappedGroup",
                  name: "wrapped",
                  props: {
                    wrapperClassName: "flex-row flex w-full gap-5",
                  },
                  fields: [
                    {
                      rhf: "Input",
                      name: "amount",
                      rules: {
                        pattern: {
                          value: /^[0-9]\d*$/,
                          message: "Must be a positive integer value",
                        },
                        required: "* Required",
                      },
                      formItemClassName: "w-48",
                      labelClassName: "text-black font-bold",
                      label: "Amount",
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
                  rhf: "Textarea",
                  name: "explanation",
                  labelClassName: "text-black font-bold",
                  label: "Explanation (optional)",
                  rules: {
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    {
      title: "Services or items with cost-sharing amounts that vary by income",
      sectionId: "services-vary-by-income",
      subsection: true,
      form: [
        {
          slots: [
            {
              name: "service-item",
              rhf: "FieldArray",
              props: {
                ...DefaultFieldGroupProps,
                appendText: "Add service or item",
                removeText: "Remove",
              },
              fields: [
                {
                  rhf: "Input",
                  rules: { required: "* Required" },
                  name: "service-item-name",
                  props: { className: "w-96" },
                  labelClassName: "text-black font-bold",
                  label: "Service or Item",
                },
                {
                  name: "array-label-non-child-style",
                  rhf: "TextDisplay",
                  text: "Income ranges for cost-sharing amount",
                  props: { className: "text-black font-bold" },
                },
                {
                  rhf: "FieldArray",
                  name: "inc-range-cost-share-amount",
                  props: {
                    appendText: "Add range",
                    fieldArrayClassName:
                      DefaultFieldGroupProps.fieldArrayClassName +
                      "space-y-6 " +
                      "ml-[0.6rem] px-4 border-l-4 border-l-primary mb-4",
                    divider: true,
                  },
                  fields: [
                    {
                      rhf: "WrappedGroup",
                      name: "wrapped",
                      props: {
                        wrapperClassName: "space-between flex-row flex w-full gap-5",
                      },
                      fields: [
                        {
                          rhf: "Input",
                          rules: {
                            pattern: {
                              value: /^\d*(?:\.\d{1,2})?$/,
                              message:
                                "Must be a positive number, maximum of two decimals, no commas. e.g. 1234.56",
                            },
                            required: "* Required",
                          },
                          name: "income-greater-than",
                          formItemClassName: "w-48",
                          labelClassName: "text-black font-bold",
                          label: "Income greater than ($)",
                        },
                        {
                          rhf: "Input",
                          rules: {
                            pattern: {
                              value: /^\d*(?:\.\d{1,2})?$/,
                              message:
                                "Must be a positive number, maximum of two decimals, no commas. e.g. 1234.56",
                            },
                            required: "* Required",
                          },
                          name: "income-lesser-than",
                          labelClassName: "text-black font-bold",
                          label: "Income less than or equal to ($)",
                        },
                      ],
                    },
                    {
                      rhf: "WrappedGroup",
                      name: "wrapped",
                      props: {
                        wrapperClassName: "space-between flex-row flex w-full gap-5",
                      },
                      fields: [
                        {
                          rhf: "Input",
                          rules: {
                            pattern: {
                              value: /^[0-9]\d*$/,
                              message: "Must be a positive integer value",
                            },
                            required: "* Required",
                          },
                          name: "amount",
                          formItemClassName: "w-48",
                          labelClassName: "text-black font-bold",
                          label: "Amount",
                        },
                        {
                          rhf: "Select",
                          rules: { required: "* Required" },
                          name: "dollar-or-percent",
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
                          rules: { required: "* Required" },
                          name: "unit",
                          formItemClassName: "w-48",
                          labelClassName: "text-black font-bold",
                          label: "Unit",
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
                      rhf: "Textarea",
                      name: "explanation",
                      labelClassName: "text-black font-bold",
                      label: "Explanation (optional)",
                      rules: {
                        pattern: {
                          value: noLeadingTrailingWhitespace,
                          message: "Must not have leading or trailing whitespace.",
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    {
      title: "Cost sharing for non-preferred drugs charged to otherwise exempt individuals",
      sectionId: "cost-share-charge-otherwise-exempt",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Select",
              rules: { required: "* Required" },
              name: "charge-otherwise-exempt",
              labelClassName: "text-black font-bold",
              label:
                "Does the state charge cost sharing for non-preferred drugs (entered above) to otherwise exempt individuals?",
              props: {
                className: "w-48",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "Select",
              rules: { required: "* Required" },
              name: "charges-same-as-non-exempt",
              labelClassName: "text-black font-bold",
              label:
                "Are the cost-sharing charges for non-preferred drugs imposed on otherwise exempt individuals the same as the charges imposed on non-exempt individuals?",
              props: {
                className: "w-48",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    name: "g2b_cost-share-charge-otherwise-exempt_charge-otherwise-exempt",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
            },
            {
              name: "charge-rate",
              rhf: "FieldArray",
              props: {
                appendText: "Add charge",
                fieldArrayClassName:
                  DefaultFieldGroupProps.fieldArrayClassName +
                  "space-y-6 " +
                  "ml-[0.6rem] px-4 border-l-4 border-l-primary mb-4",
                divider: true,
              },
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    name: "g2b_cost-share-charge-otherwise-exempt_charges-same-as-non-exempt",
                    expectedValue: "no",
                  },
                ],
                effect: { type: "show" },
              },
              fields: [
                {
                  rhf: "WrappedGroup",
                  name: "rateWrapper",
                  props: {
                    wrapperClassName: "space-between flex-row flex w-full gap-5",
                  },
                  fields: [
                    {
                      rhf: "Input",
                      rules: {
                        pattern: {
                          value: /^[0-9]\d*$/,
                          message: "Must be a positive integer value",
                        },
                        required: "* Required",
                      },
                      name: "amount",
                      formItemClassName: "w-48",
                      labelClassName: "text-black font-bold",
                      label: "Amount",
                    },
                    {
                      rhf: "Select",
                      rules: { required: "* Required" },
                      name: "dollar-or-percent",
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
                      formItemClassName: "w-48",
                      labelClassName: "text-black font-bold",
                      label: "Unit",
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
                  rhf: "Textarea",
                  name: "explanation",
                  labelClassName: "text-black font-bold",
                  label: "Explanation (optional)",
                  rules: {
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    {
      title:
        "Cost sharing for non-emergency services provided in the hospital emergency department charged to otherwise exempt individuals",
      sectionId: "cost-share-hospital-emergency-charge-otherwise-exempt",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Select",
              rules: { required: "* Required" },
              name: "charge-otherwise-exempt",
              labelClassName: "text-black font-bold",
              label:
                "Does the state charge cost sharing for non-emergency services provided in the hospital emergency department (entered above) to otherwise exempt individuals?",
              props: {
                className: "w-48",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "Select",
              rules: { required: "* Required" },
              name: "charges-same-as-non-exempt",
              labelClassName: "text-black font-bold",
              label:
                "Are the cost-sharing charges for non-emergency services provided in the hospital emergency department imposed on otherwise exempt individuals the same as the charges imposed on non-exempt individuals?",
              props: {
                className: "w-48",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    name: "g2b_cost-share-hospital-emergency-charge-otherwise-exempt_charge-otherwise-exempt",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
            },
            {
              name: "charge-rate",
              rhf: "FieldArray",
              rules: { required: "* Required" },
              props: {
                appendText: "Add charge",
                fieldArrayClassName:
                  DefaultFieldGroupProps.fieldArrayClassName +
                  "space-y-6 " +
                  "ml-[0.6rem] px-4 border-l-4 border-l-primary mb-4",
                divider: true,
              },
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    name: "g2b_cost-share-hospital-emergency-charge-otherwise-exempt_charges-same-as-non-exempt",
                    expectedValue: "no",
                  },
                ],
                effect: { type: "show" },
              },
              fields: [
                {
                  rhf: "WrappedGroup",
                  name: "rateWrapper",
                  props: {
                    wrapperClassName: "space-between flex-row flex w-full gap-5",
                  },
                  fields: [
                    {
                      rhf: "Input",
                      rules: {
                        pattern: {
                          value: /^[0-9]\d*$/,
                          message: "Must be a positive integer value",
                        },
                        required: "* Required",
                      },
                      formItemClassName: "w-46",
                      name: "amount",
                      labelClassName: "text-black font-bold",
                      label: "Amount",
                    },
                    {
                      rhf: "Select",
                      rules: { required: "* Required" },
                      name: "dollar-or-percent",
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
                      rules: { required: "* Required" },
                      name: "unit",
                      formItemClassName: "w-40",
                      labelClassName: "text-black font-bold",
                      label: "Unit",
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
                  rhf: "Textarea",
                  name: "explanation",
                  labelClassName: "text-black font-bold",
                  label: "Explanation (optional)",
                  rules: {
                    pattern: {
                      value: noLeadingTrailingWhitespace,
                      message: "Must not have leading or trailing whitespace.",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
