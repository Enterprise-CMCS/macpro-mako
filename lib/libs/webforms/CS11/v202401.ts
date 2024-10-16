import { FormSchema } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils";

export const v202401: FormSchema = {
  header:
    "CS 11: Separate CHIP eligibility—Pregnant women who have access to public employee coverage",
  subheader:
    "Sections 2110(b)(2)(B) and (b)(6) of the Social Security Act (SSA)",
  formId: "cs11",
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
                  text: "Otherwise eligible",
                  type: "default",
                  classname: "text-black",
                },
                {
                  text: " targeted low-income pregnant women who have access to public employee coverage",
                  type: "bold",
                  classname: "text-black",
                },
                {
                  text: " on the basis of their own or a family member's employment",
                  type: "default",
                  classname: "text-black",
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
      title: "Conditions",
      sectionId: "conditions",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Radio",
              label: "Conditions as described in Section 2110(b)(6) of the SSA",
              labelClassName: "font-bold text-black",
              name: "conditions",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "Maintenance of agency contribution as provided in Section 2110(b)(6)(B)",
                    value: "maintenance",
                    slots: [
                      {
                        rhf: "Upload",
                        name: "maintenance-upload",
                        description:
                          "Attach the state’s methodology for calculating the maintenance of agency contribution.",
                        descriptionAbove: true,
                        descriptionClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                        },
                      },
                      {
                        rhf: "Checkbox",
                        name: "state-assures-recalculate-maintenance",
                        props: {
                          options: [
                            {
                              label:
                                "The state assures it will recalculate expenditures for each participating public agency on an annual basis to determine if the maintenance of agency contribution continues to be met.",
                              value: "true",
                            },
                          ],
                        },
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                  {
                    label:
                      "Hardship criteria as provided in Section 2110(b)(6)(C)",
                    value: "hardship-criteria",
                    slots: [
                      {
                        rhf: "Upload",
                        name: "hardship-criteria-upload",
                        description:
                          "Attach the state's methodology for calculating the hardship condition.",
                        descriptionAbove: true,
                        descriptionClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                        },
                      },
                      {
                        rhf: "Checkbox",
                        name: "state-assures-recalculate-hardship",
                        props: {
                          options: [
                            {
                              label:
                                "The state assures it will recalculate the financial status on an annual basis to determine if the hardship condition continues to be met.",
                              value: "true",
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
            },
          ],
        },
      ],
    },
    {
      title: "Household income standards",
      subsection: true,
      sectionId: "household-income-standards",
      form: [
        {
          slots: [
            {
              rhf: "Radio",
              label:
                "Coverage under this option is extended to pregnant women whose household income is:",
              labelClassName: "font-bold text-black",
              name: "household-income-is",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The same as the income standards for targeted low-income pregnant women",
                    value: "same",
                  },
                  {
                    label:
                      "Lower than the income standards for targeted low-income pregnant women",
                    value: "lower",
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
      subsection: true,
      sectionId: "statewide-income-standards",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label: "Are income standards applied statewide?",
              labelClassName: "font-bold text-black",
              name: "standards-applied-statewide",
              props: {
                className: "w-[125px]",
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
              rules: {
                required: "* Required",
              },
            },
            {
              rhf: "WrappedGroup",
              name: "wrapped",
              label: "Statewide income standards",
              labelClassName: "font-bold text-black",
              description:
                "The upper end of an income range cannot be more than the highest income level for targeted low-income pregnant women.",
              descriptionAbove: true,
              props: {
                wrapperClassName: "flex-row flex gap-5",
              },
              fields: [
                {
                  rhf: "Input",
                  name: "above",
                  rules: {
                    pattern: {
                      value: /^[0-9]\d*$/,
                      message: "Must be a positive integer value",
                    },
                    required: "* Required",
                  },
                  label: "Above",
                  labelClassName: "font-bold text-black",
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
                      value: /^[0-9]\d*$/,
                      message: "Must be a positive integer value",
                    },
                    required: "* Required",
                  },
                  label: "Up to and including",
                  labelClassName: "font-bold text-black",
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
    {
      title: "Income standard exceptions",
      subsection: true,
      sectionId: "income-standard-exceptions",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Are there any income standard exceptions, such as populations in a county that may qualify under either a statewide income standard or a county income standard?",
              labelClassName: "font-bold text-black",
              name: "are-there-exceptions",
              props: {
                className: "w-[125px]",
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
              rules: {
                required: "* Required",
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
              labelClassName: "font-bold text-black",
              props: {
                className: "w-[696px]",
              },
              formItemClassName:
                "ml-[0.6rem] px-4 border-l-4 border-l-primary mb-4",
              dependency: {
                conditions: [
                  {
                    type: "expectedValue",
                    name: "cs11_income-standard-exceptions_are-there-exceptions",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
            },
            {
              rhf: "Checkbox",
              name: "method-of-geographic-variation",
              label: "Method of geographic variation",
              labelClassName: "font-bold text-black",
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
                        styledLabel: [
                          {
                            text: "Enter one county if the county has a unique income standard. If multiple counties share the same income standard, enter all the counties, then enter the income standard that applies to those counties.",
                            type: "paragraph",
                          },
                          {
                            text: "The upper end of the income range cannot be more than the highest income level for targeted low-income pregnant women.",
                            type: "paragraph",
                          },
                          {
                            text: "The highest income level for pregnant women cannot be more than the highest income level for children.",
                            type: "paragraph",
                          },
                        ],
                        fields: [
                          {
                            rhf: "FieldArray",
                            name: "county-info",
                            props: { appendText: "Add county" },
                            fields: [
                              {
                                rhf: "Input",
                                name: "county-name",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: noLeadingTrailingWhitespace,
                                    message:
                                      "Must not have leading or trailing whitespace.",
                                  },
                                },
                                label: "County",
                                labelClassName: "font-bold text-black",
                                props: {
                                  className: "w-[229px]",
                                },
                              },
                              {
                                rhf: "Input",
                                name: "county-above",
                                rules: {
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                  required: "* Required",
                                },
                                label: "Above",
                                labelClassName: "font-bold text-black",
                                props: {
                                  className: "w-[159px]",
                                  icon: "% FPL",
                                  iconRight: true,
                                },
                              },
                              {
                                rhf: "Input",
                                name: "county-up-to-and-including",
                                rules: {
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                  required: "* Required",
                                },
                                label: "Up to and including",
                                labelClassName: "font-bold text-black",
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
                  {
                    label: "By city",
                    value: "by-city",
                    slots: [
                      {
                        rhf: "WrappedGroup",
                        name: "wrapped",
                        styledLabel: [
                          {
                            text: "Enter one city if the city has a unique income standard. If multiple cities share the same income standard, enter all the cities, then enter the income standard that applies to those cities.",
                            type: "paragraph",
                          },
                          {
                            text: "The upper end of the income range cannot be more than the highest income level for targeted low-income pregnant women.",
                            type: "paragraph",
                          },
                          {
                            text: "The highest income level for pregnant women cannot be more than the highest income level for children.",
                            type: "paragraph",
                          },
                        ],
                        fields: [
                          {
                            rhf: "FieldArray",
                            name: "city-info",
                            props: { appendText: "Add city" },
                            fields: [
                              {
                                rhf: "Input",
                                name: "city-name",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: noLeadingTrailingWhitespace,
                                    message:
                                      "Must not have leading or trailing whitespace.",
                                  },
                                },
                                label: "City",
                                labelClassName: "font-bold text-black",
                                props: {
                                  className: "w-[229px]",
                                },
                              },
                              {
                                rhf: "Input",
                                name: "city-above",
                                rules: {
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                  required: "* Required",
                                },
                                label: "Above",
                                labelClassName: "font-bold text-black",
                                props: {
                                  className: "w-[159px]",
                                  icon: "% FPL",
                                  iconRight: true,
                                },
                              },
                              {
                                rhf: "Input",
                                name: "city-up-to-and-including",
                                rules: {
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                  required: "* Required",
                                },
                                label: "Up to and including",
                                labelClassName: "font-bold text-black",
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
                            type: "paragraph",
                          },
                          {
                            text: "The upper end of the income range cannot be more than highest income level for targeted low-income pregnant women.",
                            type: "paragraph",
                          },
                          {
                            text: "The highest income level for pregnant women cannot be more than the highest income level for children.",
                            type: "paragraph",
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
                                  wrapperClassName:
                                    "flex flex-col gap-7 ml-[0.6rem] px-4 border-l-4 border-l-primary mb-4",
                                },
                                fields: [
                                  {
                                    rhf: "Input",
                                    name: "other-geo-var",
                                    rules: {
                                      required: "* Required",
                                      pattern: {
                                        value: noLeadingTrailingWhitespace,
                                        message:
                                          "Must not have leading or trailing whitespace.",
                                      },
                                    },
                                    label: "Geographic Area",
                                    labelClassName: "font-bold text-black",
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
                                    labelClassName: "font-bold text-black",
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
                                            value: /^[0-9]\d*$/,
                                            message:
                                              "Must be a positive integer value",
                                          },
                                          required: "* Required",
                                        },
                                        label: "Above",
                                        labelClassName: "font-bold text-black",
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
                                            value: /^[0-9]\d*$/,
                                            message:
                                              "Must be a positive integer value",
                                          },
                                          required: "* Required",
                                        },
                                        label: "Up to and including",
                                        labelClassName: "font-bold text-black",
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
    {
      title: "Access to public employee coverage",
      subsection: true,
      sectionId: "access-to-public-employee-coverage",
      form: [
        {
          slots: [
            {
              rhf: "Radio",
              label: "Coverage under this option is extended to:",
              labelClassName: "font-bold text-black",
              name: "coverage-extended-to",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "All pregnant women who have access to public employee coverage",
                    value: "all-pregnant-women",
                  },
                  {
                    label:
                      "Certain pregnant women who have access to public employee coverage",
                    value: "certain-pregnant-women",
                    slots: [
                      {
                        rhf: "Checkbox",
                        name: "type-of-employee-coverage",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          options: [
                            {
                              label: "Employees of certain public agencies",
                              value: "employees-of-certain-public-agencies",
                              slots: [
                                {
                                  rhf: "FieldArray",
                                  name: "agencies",
                                  props: { appendText: "Add type" },
                                  fields: [
                                    {
                                      rhf: "Input",
                                      label: "Type of agency",
                                      labelClassName: "font-bold text-black",
                                      name: "agency-type",
                                      props: {
                                        className: "w-[527px]",
                                      },
                                      rules: {
                                        required: "* Required",
                                        pattern: {
                                          value: noLeadingTrailingWhitespace,
                                          message:
                                            "Must not have leading or trailing whitespace.",
                                        },
                                      },
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              label:
                                "Certain types of public employees or dependents of certain types of public employees",
                              value: "certain-types-of-public-employees",
                              slots: [
                                {
                                  rhf: "FieldArray",
                                  name: "types-of-public-employees",
                                  props: { appendText: "Add type" },
                                  fields: [
                                    {
                                      rhf: "Input",
                                      label: "Type of public employee",
                                      labelClassName: "font-bold text-black",
                                      name: "public-employee-type",
                                      props: {
                                        className: "w-[527px]",
                                      },
                                      rules: {
                                        pattern: {
                                          value: noLeadingTrailingWhitespace,
                                          message:
                                            "Must not have leading or trailing whitespace.",
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
      title: "Age standard",
      subsection: true,
      sectionId: "age-standard",
      form: [
        {
          slots: [
            {
              rhf: "Radio",
              label: "Age standard",
              name: "age-standard-select",
              labelClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "Same as the age criteria used for targeted low-income pregnant women",
                    value: "same-as-targeted",
                  },
                  {
                    label:
                      "Different than the age criteria used for targeted low-income pregnant women",
                    value: "different-than-targeted",
                    slots: [
                      {
                        rhf: "Radio",
                        label: "Age range",
                        labelClassName: "font-bold text-black",
                        name: "age-range",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          options: [
                            {
                              label: "From age 19, up to specific age",
                              value: "from-19",
                              slots: [
                                {
                                  rhf: "Input",
                                  label: "End of age range",
                                  labelClassName: "font-bold text-black",
                                  name: "end-of-age-range",
                                  rules: {
                                    required: "* Required",
                                    pattern: {
                                      value: /^(2[0-9]|[3-9]\d|\d{3,})$/,
                                      message:
                                        "Must be a positive integer value greater than 19",
                                    },
                                  },
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
                                  label:
                                    "Describe how it’s determined whether the applicant will be provided coverage as a child or as a pregnant woman.",
                                  labelClassName: "font-bold text-black",
                                  name: "describe-determination",
                                  rules: {
                                    pattern: {
                                      value: noLeadingTrailingWhitespace,
                                      message:
                                        "Must not have leading or trailing whitespace.",
                                    },
                                    required: "* Required",
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
                                          name: "start-age-range",
                                          rules: {
                                            pattern: {
                                              value: /^[0-9]\d*$/,
                                              message:
                                                "Must be a positive integer value",
                                            },
                                            required: "* Required",
                                          },
                                          label: "Start of age range",
                                          labelClassName:
                                            "font-bold text-black",
                                          props: {
                                            className: "w-[125px]",
                                          },
                                        },
                                        {
                                          rhf: "Input",
                                          name: "end-age-range",
                                          rules: {
                                            pattern: {
                                              value: /^[0-9]\d*$/,
                                              message:
                                                "Must be a positive integer value",
                                            },
                                            required: "* Required",
                                          },
                                          addtnlRules: [
                                            {
                                              type: "greaterThanField",
                                              strictGreater: true,
                                              fieldName:
                                                "cs11_age-standard_start-age-range",
                                              message:
                                                "Must be greater than start of age range",
                                            },
                                          ],
                                          label: "End of age range",
                                          labelClassName:
                                            "font-bold text-black",
                                          props: {
                                            className: "w-[125px]",
                                          },
                                        },
                                      ],
                                    },
                                    {
                                      rhf: "Select",
                                      label:
                                        "Does the age range for targeted low-income pregnant women overlap with the age range for targeted low-income children?",
                                      labelClassName: "font-bold text-black",
                                      name: "age-range-overlap",
                                      rules: {
                                        required: "* Required",
                                      },
                                      props: {
                                        className: "w-[125px]",
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
                                    {
                                      rhf: "Textarea",
                                      label:
                                        "Describe how it's determined whether the applicant will be provided coverage as a child or as a pregnant woman.",
                                      labelClassName: "font-bold text-black",
                                      name: "describe-determination",
                                      formItemClassName:
                                        "ml-[0.6rem] pl-6 mt-4 border-l-4 border-l-primary",
                                      rules: {
                                        pattern: {
                                          value: noLeadingTrailingWhitespace,
                                          message:
                                            "Must not have leading or trailing whitespace.",
                                        },
                                        required: "* Required",
                                      },
                                      dependency: {
                                        conditions: [
                                          {
                                            name: "cs11_age-standard_age-range-overlap",
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
                          ],
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
  ],
};
