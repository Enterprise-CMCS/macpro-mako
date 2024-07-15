import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "Premiums and cost sharing G2a: Cost-sharing amounts—Categorically needy individuals",
  formId: "g2a",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              name: "state-charge-categorically-needy",
              labelClassName: "font-bold",
              label:
                "Does the state charge cost sharing to all categorically needy (mandatory coverage and options for coverage) individuals?",
              props: {
                className: "w-48",
                options: [
                  {
                    label: "Yes",
                    value: "yes",
                  },
                  {
                    label: "No",
                    value: "no",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title:
        "Services or items with the same cost-sharing amounts for all incomes",
      subsection: true,
      sectionId: "services-same-all-income",
      form: [
        {
          slots: [
            {
              rhf: "FieldGroup",
              name: "service-item",
              props: {
                appendText: "Add service or item",
              },
              fields: [
                {
                  rhf: "Input",
                  name: "service-item-name",
                  props: { className: "w-96" },
                  labelClassName: "font-bold",
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
                      formItemClassName: "w-48",
                      labelClassName: "font-bold",
                      label: "Amount",
                    },
                    {
                      rhf: "Select",
                      name: "dollar-or-percent",
                      formItemClassName: "w-56",
                      labelClassName: "font-bold",
                      label: "Dollar or percentage",
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
                      labelClassName: "font-bold",
                      label: "Unit",
                      formItemClassName: "w-48",
                      props: {
                        options: [
                          { label: "Day", value: "Day" },
                          { label: "Month", value: "Month" },
                          { label: "Visit", value: "Visit" },
                          { label: "Perscription", value: "Perscription" },
                          { label: "15 Minute", value: "15 Minute" },
                          { label: "30 Minute", value: "30 Minute" },
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
                  labelClassName: "font-bold",
                  label: "Explanation (optional):",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Services or items with cost-sharing amounts that vary by income",
      subsection: true,
      sectionId: "services-vary-by-income",
      form: [
        {
          slots: [
            {
              name: "service-item",
              rhf: "FieldGroup",
              props: {
                appendText: "Add service or item",
              },
              fields: [
                {
                  rhf: "Input",
                  name: "service-item-name",
                  props: { className: "w-96" },
                  labelClassName: "font-bold",
                  label: "Service or Item",
                },
                {
                  rhf: "FieldArray",
                  name: "inc-range-cost-share-amount",
                  formItemClassName:
                    "ml-[0.6rem] px-4  border-l-4 border-l-primary mt-2",
                  props: {
                    appendText: "Add range",
                    fieldArrayClassName: "flex-col",
                  },
                  fields: [
                    {
                      rhf: "WrappedGroup",
                      name: "wrapped",
                      props: {
                        wrapperClassName:
                          "space-between flex-row flex w-full gap-5",
                      },
                      fields: [
                        {
                          rhf: "Input",
                          name: "income-greater-than",
                          formItemClassName: "w-48",
                          labelClassName: "font-bold",
                          label: "Income greater than ($)",
                        },
                        {
                          rhf: "Input",
                          name: "income-lesser-than",
                          labelClassName: "font-bold",
                          label: "Income less than or equal to ($)",
                        },
                      ],
                    },
                    {
                      rhf: "WrappedGroup",
                      name: "wrapped",
                      props: {
                        wrapperClassName:
                          "space-between flex-row flex w-full gap-5",
                      },
                      fields: [
                        {
                          rhf: "Input",
                          name: "amount",
                          formItemClassName: "w-48",
                          labelClassName: "font-bold",
                          label: "Amount",
                        },
                        {
                          rhf: "Select",
                          name: "dollar-or-percent",
                          formItemClassName: "w-56",
                          labelClassName: "font-bold",
                          label: "Dollar or percentage",
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
                          formItemClassName: "w-48",
                          labelClassName: "font-bold",
                          label: "Unit",
                          props: {
                            options: [
                              { label: "Day", value: "Day" },
                              { label: "Month", value: "Month" },
                              { label: "Visit", value: "Visit" },
                              { label: "Perscription", value: "Perscription" },
                              { label: "15 Minute", value: "15 Minute" },
                              { label: "30 Minute", value: "30 Minute" },
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
                      labelClassName: "font-bold",
                      label: "Explanation (optional):",
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
      title:
        "Cost sharing for non-preferred drugs charged to otherwise exempt individuals",
      subsection: true,
      sectionId: "cost-share-charge-otherwise-exempt",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              name: "charge-otherwise-exempt",
              labelClassName: "font-bold",
              label:
                "Does the state charge cost sharing for non-preferred drugs to otherwise exempt individuals?",
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
              name: "charges-same-as-non-exempt",
              labelClassName: "font-bold",
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
                    name: "g2a_cost-share-charge-otherwise-exempt_charge-otherwise-exempt",
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
                fieldArrayClassName: "flex-col",
              },
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    name: "g2a_cost-share-charge-otherwise-exempt_charges-same-as-non-exempt",
                    expectedValue: "no",
                  },
                ],
                effect: { type: "show" },
              },
              formItemClassName:
                "ml-[0.6rem] px-4  border-l-4 border-l-primary mt-2",
              fields: [
                {
                  rhf: "WrappedGroup",
                  name: "rateWrapper",
                  props: {
                    wrapperClassName:
                      "space-between flex-row flex w-full gap-5",
                  },
                  fields: [
                    {
                      rhf: "Input",
                      name: "amount",
                      formItemClassName: "w-48",
                      labelClassName: "font-bold",
                      label: "Amount",
                    },
                    {
                      rhf: "Select",
                      name: "dollar-or-percent",
                      formItemClassName: "w-56",
                      labelClassName: "font-bold",
                      label: "Dollar or percentage",
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
                      formItemClassName: "w-48",
                      labelClassName: "font-bold",
                      label: "Unit",
                      props: {
                        options: [
                          { label: "Day", value: "Day" },
                          { label: "Month", value: "Month" },
                          { label: "Visit", value: "Visit" },
                          { label: "Perscription", value: "Perscription" },
                          { label: "15 Minute", value: "15 Minute" },
                          { label: "30 Minute", value: "30 Minute" },
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
                  labelClassName: "font-bold",
                  label: "Explanation (optional):",
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
      subsection: true,
      sectionId: "cost-share-hospital-emergency-charge-otherwise-exempt",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              name: "charge-otherwise-exempt",
              labelClassName: "font-bold",
              label:
                "Does the state charge cost sharing for non-emergency services provided in the hospital emergency department to otherwise exempt individuals?",
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
              name: "charges-same-as-non-exempt",
              labelClassName: "font-bold",
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
                    name: "g2a_cost-share-hospital-emergency-charge-otherwise-exempt_charge-otherwise-exempt",
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
                fieldArrayClassName: "flex-col",
              },
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    name: "g2a_cost-share-hospital-emergency-charge-otherwise-exempt_charges-same-as-non-exempt",
                    expectedValue: "no",
                  },
                ],
                effect: { type: "show" },
              },
              formItemClassName:
                "ml-[0.6rem] px-4 border-l-4 border-l-primary mt-2",
              fields: [
                {
                  rhf: "WrappedGroup",
                  name: "rateWrapper",
                  props: {
                    wrapperClassName:
                      "space-between flex-row flex w-full gap-5",
                  },
                  fields: [
                    {
                      rhf: "Input",
                      formItemClassName: "w-46",
                      name: "amount",
                      labelClassName: "font-bold",
                      label: "Amount",
                    },
                    {
                      rhf: "Select",
                      name: "dollar-or-percent",
                      formItemClassName: "w-56",
                      labelClassName: "font-bold",
                      label: "Dollar or percentage",
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
                      formItemClassName: "w-40",
                      labelClassName: "font-bold",
                      label: "Unit",
                      props: {
                        options: [
                          { label: "Day", value: "Day" },
                          { label: "Month", value: "Month" },
                          { label: "Visit", value: "Visit" },
                          { label: "Perscription", value: "Perscription" },
                          { label: "15 Minute", value: "15 Minute" },
                          { label: "30 Minute", value: "30 Minute" },
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
                  labelClassName: "font-bold",
                  label: "Explanation (optional):",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
