import { FormSchema } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils/regex";

export const v202401: FormSchema = {
  header: "CS 8: Separate CHIP eligibility—Targeted low-income pregnant women",
  subheader: "Section 2112 of the Social Security Act (SSA)",
  formId: "cs8",
  sections: [
    {
      title: "Overview",
      sectionId: "overview",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "chip-cover-group-follow-provisions",
              styledLabel: [
                {
                  text: "Targeted low-income pregnant women",
                  type: "bold",
                },
                {
                  text: " are uninsured pregnant or postpartum women who do not have access to public employee coverage and whose household income is within standards established by the state.",
                  type: "default",
                },
              ],
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The CHIP agency operates this covered group in accordance with the following provisions.",
                    value: "true",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Age",
      sectionId: "age",
      subsection: true,
      form: [
        {
          description:
            "The state provides coverage to pregnant women in the following age ranges:",
          descriptionClassName: "text-base",
          slots: [
            {
              rhf: "Radio",
              name: "age-range",
              label: "Age range",
              labelClassName: "font-bold",
              descriptionAbove: true,
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "From age 19, up to specific age",
                    value: "from-age-19",
                    slots: [
                      {
                        rhf: "Input",
                        name: "end-age-range",
                        rules: {},
                        label: "End of age range",
                        labelClassName: "font-bold",
                        props: {
                          className: "w-[125px]",
                        },
                      },
                    ],
                  },
                  {
                    label: "No age restriction",
                    value: "no-age-restriction",
                    slots: [
                      {
                        rhf: "Textarea",
                        name: "no-age-describe-applicant-child-preg-woman",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                        label:
                          "Describe how it’s determined whether the applicant will be provided coverage as a child or as a pregnant woman.",
                        labelClassName: "font-bold",
                        props: {
                          className: "w-[696px]",
                        },
                      },
                    ],
                  },
                  {
                    label: "Another age range",
                    value: "another-age-range",
                    slots: [
                      {
                        rhf: "WrappedGroup",
                        name: "wrapped",
                        props: {
                          wrapperClassName: "flex-row flex gap-5",
                        },
                        fields: [
                          {
                            rhf: "Input",
                            name: "start-age-range",
                            rules: {
                              pattern: {
                                value: /^\d*\.?\d+$/,
                                message: "Must be a positive percentage",
                              },
                              required: "* Required",
                            },
                            label: "Start of age range",
                            labelClassName: "font-bold",
                            props: {
                              className: "w-[125px]",
                            },
                          },
                          {
                            rhf: "Input",
                            name: "end-age-range",
                            rules: {
                              pattern: {
                                value: /^\d*\.?\d+$/,
                                message: "Must be a positive percentage",
                              },
                              required: "* Required",
                            },
                            label: "End of age range",
                            labelClassName: "font-bold",
                            props: {
                              className: "w-[125px]",
                            },
                          },
                        ],
                      },
                      {
                        rhf: "Select",
                        name: "does-preg-woman-range-overlap-with-child",
                        rules: {
                          required: "* Required",
                        },
                        label:
                          "Does the age range for targeted low-income pregnant women overlap with the age range for targeted low-income children?",
                        labelClassName: "font-bold",
                        props: {
                          className: "w-[125px]",
                          options: [
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                          ],
                        },
                      },
                      {
                        rhf: "Textarea",
                        name: "describe-applicant-child-preg-woman",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: noLeadingTrailingWhitespace,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                        label:
                          "Describe how it’s determined whether the applicant will be provided coverage as a child or as a pregnant woman.",
                        labelClassName: "font-bold",
                        formItemClassName:
                          "ml-[0.6rem] px-4 border-l-4 border-l-primary mb-4",
                        props: {
                          className: "w-[658px]",
                        },
                        dependency: {
                          conditions: [
                            {
                              type: "expectedValue",
                              name: "cs8_age_does-preg-woman-range-overlap-with-child",
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
          description:
            "Coverage for pregnant women may only be provided if the children's qualifying income standard under the plan is at least 200% of the federal poverty level (FPL) for all age ranges.",
          descriptionClassName: "text-base",
          slots: [
            {
              rhf: "Select",
              name: "standards-applied-state",
              label: "Are income standards applied statewide?",
              labelClassName: "font-bold",
              rules: {
                required: "* Required",
              },
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
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
                  name: "above",
                  rules: {
                    pattern: {
                      value: /^\d*\.?\d+$/,
                      message: "Must be a positive percentage",
                    },
                    required: "* Required",
                  },
                  label: "Above",
                  labelClassName: "font-bold",
                  props: {
                    className: "w-[159px]",
                    icon: "% FPL",
                    iconRight: true,
                  },
                },
                {
                  rhf: "Input",
                  name: "up-to-and-including",
                  rules: {
                    pattern: {
                      value: /^\d*\.?\d+$/,
                      message: "Must be a positive percentage",
                    },
                    required: "* Required",
                  },
                  label: "Up to and including",
                  labelClassName: "font-bold",
                  props: {
                    icon: "% FPL",
                    iconRight: true,
                    className: "w-[159px]",
                  },
                },
              ],
              styledLabel: [
                {
                  text: "Statewide income standards",
                  type: "bold",
                  classname: "block pb-2",
                },
                {
                  text: "CHIP coverage for pregnant women may only be provided if the qualifying income standard under Medicaid for pregnant women is at least 185% FPL.",
                  type: "default",
                  classname: "block pb-2",
                },
                {
                  text: "The highest income level for pregnant women cannot be more than the highest income level for children.",
                },
              ],
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
              name: "any-except-such-as-pop",
              rules: {
                required: "* Required",
              },
              label:
                "Are there any exceptions, such as populations in a county that may qualify under either a statewide income standard or a county income standard?",
              labelClassName: "font-bold",
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "Textarea",
              name: "explain-overlap-diff-income-standards",
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              label:
                "Explain, including a description of the overlapping geographic area and the reason for having different income standards.",
              labelClassName: "font-bold",
              props: {
                className: "w-[696px]",
              },
              formItemClassName:
                "ml-[0.6rem] px-4 border-l-4 border-l-primary mb-4",
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    name: "cs8_income-standard-exceptions_any-except-such-as-pop",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
            },
            {
              rhf: "Checkbox",
              name: "geo-variation",
              label: "Method of geographic variation",
              labelClassName: "font-bold",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "By county",
                    value: "county",
                    slots: [
                      {
                        rhf: "WrappedGroup",
                        name: "wrapped",
                        styledLabel: [
                          {
                            text: "Enter one county if the county has a unique income standard. If multiple counties share the same income standard, enter all the counties, then enter the income standard that applies to those counties.",
                            type: "default",
                            classname: "block pb-2",
                          },
                          {
                            text: "CHIP coverage for pregnant women may only be provided if the qualifying income standard under Medicaid for pregnant women is at least 185% FPL.",
                            type: "default",
                            classname: "block pb-2",
                          },
                          {
                            text: "The highest income level for pregnant women cannot be more than the highest income level for children.",
                            type: "default",
                            classname: "block pb-2",
                          },
                        ],
                        fields: [
                          {
                            rhf: "FieldArray",
                            name: "county-info",
                            props: { appendText: "Add County" },
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
                                    name: "county-geo-var",
                                    rules: {},
                                    label: "County",
                                    labelClassName: "font-bold",
                                    props: {
                                      className: "w-[125px]",
                                    },
                                  },
                                  {
                                    rhf: "Input",
                                    name: "above-county-geo-var",
                                    rules: {
                                      pattern: {
                                        value: /^\d*\.?\d+$/,
                                        message:
                                          "Must be a positive percentage",
                                      },
                                      required: "* Required",
                                    },
                                    label: "Above",
                                    labelClassName: "font-bold",
                                    props: {
                                      className: "w-[159px]",
                                      icon: "% FPL",
                                      iconRight: true,
                                    },
                                  },
                                  {
                                    rhf: "Input",
                                    name: "up-to-and-including-county-geo-var",
                                    rules: {
                                      pattern: {
                                        value: /^\d*\.?\d+$/,
                                        message:
                                          "Must be a positive percentage",
                                      },
                                      required: "* Required",
                                    },
                                    label: "Up to and including",
                                    labelClassName: "font-bold",
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
                    value: "city",
                    slots: [
                      {
                        rhf: "WrappedGroup",
                        name: "wrapped",
                        styledLabel: [
                          {
                            text: "Enter one city if the city has a unique income standard. If multiple cities share the same income standard, enter all the cities, then enter the income standard that applies to those cities.",
                            type: "default",
                            classname: "block pb-2",
                          },
                          {
                            text: "CHIP coverage for pregnant women may only be provided if the qualifying income standard under Medicaid for pregnant women is at least 185% FPL.",
                            type: "default",
                            classname: "block pb-2",
                          },
                          {
                            text: "The highest income level for pregnant women cannot be more than the highest income level for children.",
                            type: "default",
                            classname: "block pb-2",
                          },
                        ],
                        fields: [
                          {
                            rhf: "FieldArray",
                            name: "city-info",
                            props: { appendText: "Add City" },
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
                                    name: "city-geo-var",
                                    rules: {},
                                    label: "City",
                                    labelClassName: "font-bold",
                                    props: {
                                      className: "w-[125px]",
                                    },
                                  },
                                  {
                                    rhf: "Input",
                                    name: "above-city-geo-var",
                                    rules: {
                                      pattern: {
                                        value: /^\d*\.?\d+$/,
                                        message:
                                          "Must be a positive percentage",
                                      },
                                      required: "* Required",
                                    },
                                    label: "Above",
                                    labelClassName: "font-bold",
                                    props: {
                                      className: "w-[159px]",
                                      icon: "% FPL",
                                      iconRight: true,
                                    },
                                  },
                                  {
                                    rhf: "Input",
                                    name: "up-to-and-including-city-geo-var",
                                    rules: {
                                      pattern: {
                                        value: /^\d*\.?\d+$/,
                                        message:
                                          "Must be a positive percentage",
                                      },
                                      required: "* Required",
                                    },
                                    label: "Up to and including",
                                    labelClassName: "font-bold",
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
                    value: "other-geo-area",
                    slots: [
                      {
                        rhf: "WrappedGroup",
                        name: "wrapped",
                        styledLabel: [
                          {
                            text: "Enter each geographic area with a unique income standard.",
                            type: "default",
                            classname: "block pb-2",
                          },
                          {
                            text: "CHIP coverage for pregnant women may only be provided if the qualifying income standard under Medicaid for pregnant women is at least 185% FPL.",
                            type: "default",
                            classname: "block pb-2",
                          },
                          {
                            text: "The highest income level for pregnant women cannot be more than the highest income level for children.",
                            type: "default",
                            classname: "block pb-2",
                          },
                        ],
                        fields: [
                          {
                            rhf: "FieldArray",
                            name: "other-geo-area",
                            props: { appendText: "Add geographic area" },
                            fields: [
                              {
                                rhf: "WrappedGroup",
                                name: "wrapped",
                                props: {
                                  wrapperClassName: "flex flex-col gap-7",
                                },
                                fields: [
                                  {
                                    rhf: "Input",
                                    name: "other-geo-var",
                                    rules: {},
                                    label: "Geographic Area",
                                    labelClassName: "font-bold",
                                    props: {
                                      className: "w-[527px]",
                                    },
                                  },
                                  {
                                    rhf: "Textarea",
                                    name: "other-geo-area-describe",
                                    rules: {
                                      required: "* Required",
                                      pattern: {
                                        value: noLeadingTrailingWhitespace,
                                        message:
                                          "Must not have leading or trailing whitespace.",
                                      },
                                    },
                                    label: "Describe",
                                    labelClassName: "font-bold",
                                    props: {
                                      className: "w-[527px]",
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
                                        name: "other-above-geo-var",
                                        rules: {
                                          pattern: {
                                            value: /^\d*\.?\d+$/,
                                            message:
                                              "Must be a positive percentage",
                                          },
                                          required: "* Required",
                                        },
                                        label: "Above",
                                        labelClassName: "font-bold",
                                        props: {
                                          className: "w-[159px]",
                                          icon: "% FPL",
                                          iconRight: true,
                                        },
                                      },
                                      {
                                        rhf: "Input",
                                        name: "up-to-and-including-other-geo-var",
                                        rules: {
                                          pattern: {
                                            value: /^\d*\.?\d+$/,
                                            message:
                                              "Must be a positive percentage",
                                          },
                                          required: "* Required",
                                        },
                                        label: "Up to and including",
                                        labelClassName: "font-bold",
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
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
