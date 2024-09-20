import { FormSchema } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils";

export const v202401: FormSchema = {
  header:
    "CS 9: Separate CHIP eligibility—Coverage from conception to end of pregnancy",
  subheader: "Section 2112 of the Social Security Act and 42 CFR 457.10",
  formId: "cs9",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              rhf: "TextDisplay",
              name: "overview-description",
              text: [
                {
                  text: "Coverage from conception to end of pregnancy",
                  type: "bold",
                },
                {
                  text: " when the mother is not otherwise eligible for Medicaid or CHIP",
                  type: "default",
                },
              ],
            },
            {
              rhf: "Checkbox",
              name: "chip-agency-operates-group",
              props: {
                options: [
                  {
                    label:
                      "The CHIP agency operates this covered group in accordance with the following provisions.",
                    value: "chip-agency-operates-group",
                  },
                ],
              },
              rules: {
                required: "* Required",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Age standard",
      sectionId: "age-standard",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label: "The age standard is from conception to end of pregnancy.",
              labelClassName: "text-black pb-4",
              description:
                "Does the state have an additional age definition or other age-related conditions?",
              descriptionAbove: true,
              descriptionClassName: "font-bold",

              name: "age-standard",
              rules: {
                required: "* Required",
              },
              props: {
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
                className: "w-[125px]",
              },
            },
            {
              rhf: "Textarea",
              label: "Describe",
              labelClassName: "text-black font-bold",
              name: "age-standard-description",
              formItemClassName:
                "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              rules: {
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
                required: "* Required",
              },
              dependency: {
                conditions: [
                  {
                    name: "cs9_age-standard_age-standard",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
            },
          ],
        },
      ],
    },
    {
      title: "Statewide income standards",
      sectionId: "statewide-income-standards",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label: "Are income standards applied statewide?",
              labelClassName: "text-black font-bold",
              name: "statewide-income-standards",
              rules: {
                required: "* Required",
              },
              props: {
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
                className: "w-[125px]",
              },
            },
            {
              rhf: "Input",
              label: "Statewide income standard",
              labelClassName: "text-black font-bold",
              name: "statewide-income-standard-from",
              description: "From zero up to",
              descriptionAbove: true,
              descriptionClassName: "font-bold",
              rules: {
                pattern: {
                  value: /^[0-9]\d*$/,
                  message: "Must be a positive integer value",
                },
                required: "* Required",
              },
              props: {
                icon: "% FPL",
                iconRight: true,
                className: "w-[159px]",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Income standard exceptions",
      sectionId: "income-standard-exceptions",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Are there any exceptions, such as populations in a county that may qualify under either a statewide income standard or a county income standard?",
              labelClassName: "text-black font-bold",
              name: "are-there-exceptions",
              rules: {
                required: "* Required",
              },
              props: {
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
                className: "w-[125px]",
              },
            },
            {
              rhf: "Textarea",
              label:
                "Explain, including a description of the overlapping geographic area and the reason for having different income standards.",
              labelClassName: "text-black font-bold",
              name: "income-standard-exceptions-description",
              formItemClassName:
                "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              rules: {
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
                required: "* Required",
              },
              dependency: {
                conditions: [
                  {
                    name: "cs9_income-standard-exceptions_are-there-exceptions",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
              props: {
                className: "min-h-[76px]",
              },
            },
            {
              rhf: "Checkbox",
              label: "Method of geographic variation",
              labelClassName: "text-black font-bold",
              name: "method-of-geographic-variation",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "By county",
                    value: "by-county",
                    slots: [
                      {
                        rhf: "WrappedGroup",
                        name: "wrapped",
                        label:
                          "Enter one county if the county has a unique income standard. If multiple counties share the same income standard, enter all the counties, then enter the income standard that applies to those counties.",
                        fields: [
                          {
                            rhf: "FieldArray",
                            name: "county-income-standard",
                            props: {
                              appendText: "Add county",
                            },
                            fields: [
                              {
                                rhf: "WrappedGroup",
                                name: "wrapped",
                                props: {
                                  wrapperClassName: "flex-row flex gap-5",
                                },
                                fields: [
                                  {
                                    rhf: "Input",
                                    label: "County",
                                    labelClassName: "text-black font-bold",
                                    name: "county",
                                    rules: {
                                      required: "* Required",
                                      pattern: {
                                        value: /^\S(.*\S)?$/,
                                        message:
                                          "Must not have leading or trailing whitespace.",
                                      },
                                    },
                                    props: {
                                      className: "w-[355px]",
                                    },
                                  },
                                  {
                                    rhf: "Input",
                                    label: "From zero up to",
                                    labelClassName: "text-black font-bold",
                                    name: "county-up-to",
                                    rules: {
                                      pattern: {
                                        value: /^[0-9]\d*$/,
                                        message:
                                          "Must be a positive integer value",
                                      },
                                      required: "* Required",
                                    },
                                    props: {
                                      icon: "% FPL",
                                      iconRight: true,
                                      className: "w-[159px]",
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
                    label: "By city",
                    value: "by-city",
                    slots: [
                      {
                        rhf: "WrappedGroup",
                        name: "wrapped",
                        label:
                          "Enter one city if the city has a unique income standard. If multiple cities share the same income standard, enter all the cities, then enter the income standard that applies to those cities.",
                        fields: [
                          {
                            rhf: "FieldArray",
                            name: "city-income-standard",
                            props: {
                              appendText: "Add city",
                            },
                            fields: [
                              {
                                rhf: "WrappedGroup",
                                name: "wrapped",
                                props: {
                                  wrapperClassName: "flex-row flex gap-5",
                                },
                                fields: [
                                  {
                                    rhf: "Input",
                                    label: "City",
                                    labelClassName: "text-black font-bold",
                                    name: "city",
                                    rules: {
                                      required: "* Required",
                                      pattern: {
                                        value: /^\S(.*\S)?$/,
                                        message:
                                          "Must not have leading or trailing whitespace.",
                                      },
                                    },
                                    props: {
                                      className: "w-[355px]",
                                    },
                                  },
                                  {
                                    rhf: "Input",
                                    label: "From zero up to",
                                    labelClassName: "text-black font-bold",
                                    name: "city-up-to",
                                    rules: {
                                      pattern: {
                                        value: /^[0-9]\d*$/,
                                        message:
                                          "Must be a positive integer value",
                                      },
                                      required: "* Required",
                                    },
                                    props: {
                                      icon: "% FPL",
                                      iconRight: true,
                                      className: "w-[159px]",
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
                    label: "Other geographic area",
                    value: "other-geographic-area",
                    slots: [
                      {
                        rhf: "TextDisplay",
                        text: "Enter each geographic area with a unique income standard.",
                        name: "geographic-area-description-text",
                      },
                      {
                        rhf: "FieldArray",
                        name: "other-geo-income-standard",
                        props: {
                          appendText: "Add geographic area",
                          fieldArrayClassName: "flex-col",
                        },
                        fields: [
                          {
                            rhf: "WrappedGroup",
                            name: "wrapped",
                            props: {
                              wrapperClassName:
                                "flex flex-col gap-5 ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
                            },
                            fields: [
                              {
                                rhf: "Input",
                                label: "Geographic area",
                                labelClassName: "text-black font-bold",
                                name: "geographic-area",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: /^\S(.*\S)?$/,
                                    message:
                                      "Must not have leading or trailing whitespace.",
                                  },
                                },
                                props: {
                                  className: "w-[527px]",
                                },
                              },
                              {
                                rhf: "Textarea",
                                label: "Describe",
                                labelClassName: "text-black font-bold",
                                name: "geographic-area-description",
                                rules: {
                                  pattern: {
                                    value: noLeadingTrailingWhitespace,
                                    message:
                                      "Must not have leading or trailing whitespace.",
                                  },
                                  required: "* Required",
                                },
                                props: {
                                  className: "min-h-[76px] w-[527px]",
                                },
                              },
                              {
                                rhf: "WrappedGroup",
                                name: "wrapped",
                                props: {
                                  wrapperClassName: "flex-row flex gap-5",
                                },
                                fields: [
                                  {
                                    rhf: "Input",
                                    label: "Above",
                                    labelClassName: "text-black font-bold",
                                    name: "geographic-area-above",
                                    props: {
                                      icon: "% FPL",
                                      iconRight: true,
                                      className: "w-[159px]",
                                    },
                                    rules: {
                                      pattern: {
                                        value: /^[0-9]\d*$/,
                                        message:
                                          "Must be a positive integer value",
                                      },
                                      required: "* Required",
                                    },
                                  },
                                  {
                                    rhf: "Input",
                                    label: "Up to and including",
                                    labelClassName: "text-black font-bold",
                                    name: "geographic-area-up-to-and-including",
                                    props: {
                                      icon: "% FPL",
                                      iconRight: true,
                                      className: "w-[159px]",
                                    },
                                    rules: {
                                      pattern: {
                                        value: /^[0-9]\d*$/,
                                        message:
                                          "Must be a positive integer value",
                                      },
                                      required: "* Required",
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
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Policy exemptions",
      sectionId: "policy-exemptions",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "WrappedGroup",
              name: "policy-exemptions-group",
              props: {
                wrapperClassName: "flex flex-col gap-3",
              },
              fields: [
                {
                  rhf: "Checkbox",
                  labelClassName: "text-black font-bold",
                  name: "policy-exemptions-1",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        label:
                          "Exempt from requirement of providing or applying for a Social Security number (SSN)",
                        value: "exempt-from-ssn",
                      },
                    ],
                  },
                },
                {
                  rhf: "Checkbox",
                  name: "policy-exemptions-2",
                  rules: {
                    required: "* Required",
                  },
                  props: {
                    options: [
                      {
                        label:
                          "Exempt from requirement of verifying citizenship status",
                        value: "exempt-from-citizenship-status",
                      },
                    ],
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
