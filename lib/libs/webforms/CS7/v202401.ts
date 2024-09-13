import { DefaultFieldGroupProps, FormSchema } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils";

// Creates an array of options for the age select field, 0-19 inclusive
const ageOptions = Array.from({ length: 20 }, (_, i) => ({
  value: i.toString(),
  label: i.toString(),
}));

export const v202401: FormSchema = {
  header: "CS 7: Separate CHIP eligibility—Targeted low-income children",
  subheader:
    "2102(b)(1)(B)(v) of the Social Security Act and 42 CFR 457.310, 457.315, and 457.320",
  formId: "cs7",
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
                { text: "Targeted low-income children", type: "bold" },
                {
                  text: " are uninsured children under age 19 whose household income is within standards established by the state.",
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
      title: "Provisions",
      sectionId: "provisions",
      form: [],
    },
    {
      title: "Age",
      sectionId: "provisions_age",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "TextDisplay",
              name: "age-description",
              text: [{ text: "Must be under age 19." }],
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
              name: "statewide-income-standards-select",
              label: "Are income standards applied statewide?",
              labelClassName: "text-black font-bold",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ],
                className: "w-[125px]",
              },
            },
            {
              rhf: "WrappedGroup",
              name: "statewide-income-standards-group",
              fields: [
                {
                  rhf: "TextDisplay",
                  name: "statewide-income-standards-description",
                  formItemClassName: "mb-6",
                  text: [
                    { text: "Statewide income standards", type: "bold" },
                    { text: "", type: "br" },
                    {
                      text: "Begin with the youngest age range first.",
                      type: "brWrap",
                    },
                    {
                      text: "The lower limit for CHIP eligibility should be the highest standard used for Medicaid children for the same age group(s) entered here.",
                      type: "brWrap",
                    },
                  ],
                },
                {
                  rhf: "FieldArray",
                  name: "statewide-income-standards-fields",
                  descriptionClassName: "statewide-income-standards-fields",
                  formItemClassName:
                    "statewide-income-standards-fields [&_.slot-form-message]:w-max",
                  props: {
                    appendText: "Add range",
                  },
                  fields: [
                    {
                      rhf: "Select",
                      label: "From age",
                      labelClassName: "text-black font-bold",
                      name: "from-age",
                      formItemClassName: "w-[125px]",
                      rules: {
                        required: "* Required",
                      },
                      props: {
                        options: ageOptions,
                      },
                      addtnlRules: [
                        {
                          type: "toGreaterThanFrom",
                          fieldName: "statewide-income-standards-fields",
                          fromField: "from-age",
                          toField: "to-age",
                          message: "To age must be greater than From age",
                        },
                      ],
                    },
                    {
                      rhf: "Select",
                      label: "To age",
                      labelClassName: "text-black font-bold",
                      name: "to-age",
                      formItemClassName: "w-[125px]",
                      rules: {
                        required: "* Required",
                      },
                      props: {
                        options: ageOptions,
                      },
                    },
                    {
                      rhf: "Input",
                      label: "Above",
                      labelClassName: "text-black font-bold",
                      name: "above",
                      rules: {
                        required: "* Required",
                        pattern: {
                          value: /^[0-9]\d*$/,
                          message: "Must be a positive integer value",
                        },
                      },
                      formItemClassName: "w-[159px]",
                      props: {
                        icon: "% FPL",
                        iconRight: true,
                      },
                    },
                    {
                      rhf: "Input",
                      label: "Up to and including",
                      labelClassName: "text-black font-bold",
                      name: "up-to-and-including",
                      rules: {
                        required: "* Required",
                        pattern: {
                          value: /^[0-9]\d*$/,
                          message: "Must be a positive integer value",
                        },
                      },
                      formItemClassName: "w-[159px]",
                      props: {
                        icon: "% FPL",
                        iconRight: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              rhf: "Select",
              label: "Do the age ranges overlap?",
              labelClassName: "text-black font-bold",
              name: "age-ranges-overlap",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ],
                className: "w-[125px]",
              },
            },
            {
              rhf: "Textarea",
              label:
                "Explain, including the age ranges for each income standard that has overlapping ages and the reason for having different income standards.",
              labelClassName: "text-black font-bold",
              name: "age-ranges-overlap-explanation",
              props: {
                className: "min-h-[114px]",
              },
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              formItemClassName:
                "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              dependency: {
                conditions: [
                  {
                    name: "cs7_statewide-income-standards_age-ranges-overlap",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: {
                  type: "show",
                },
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
              name: "are-there-any-exceptions",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ],
                className: "w-[125px]",
              },
            },
            {
              rhf: "Textarea",
              label:
                "Explain, including a description of the overlapping geographic area and the reason for having different income standards.",
              labelClassName: "text-black font-bold",
              name: "explanation",
              props: {
                className: "min-h-[76px]",
              },
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              dependency: {
                conditions: [
                  {
                    name: "cs7_income-standard-exceptions_are-there-any-exceptions",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: {
                  type: "show",
                },
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
              dependency: {
                conditions: [
                  {
                    name: "cs7_income-standard-exceptions_are-there-any-exceptions",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: {
                  type: "show",
                },
              },
              props: {
                options: [
                  {
                    label: "By county",
                    value: "by-county",
                    slots: [
                      {
                        rhf: "TextDisplay",
                        name: "county-description",
                        formItemClassName: "pb-6 border-b-2",
                        text: [
                          {
                            text: "Enter one county if the county has a unique income standard. If multiple counties share the same income standard, enter all the counties, then enter the income standard that applies to those counties.",
                          },
                        ],
                      },
                      {
                        rhf: "FieldArray",
                        name: "cs7_income-standard-exceptions_counties",
                        props: {
                          ...DefaultFieldGroupProps,
                          appendText: "Add county",
                          removeText: "Remove",
                        },
                        fields: [
                          {
                            rhf: "Input",
                            label: "County",
                            labelClassName: "text-black font-bold",
                            props: {
                              className: "w-[527px]",
                            },
                            name: "county",
                            rules: {
                              required: "* Required",
                            },
                          },
                          {
                            rhf: "FieldArray",
                            name: "county-field-ranges",
                            description:
                              "Begin with the youngest age range first. The lower limit for CHIP eligibility should be the highest standard used for Medicaid children for the same age group(s) entered here.",
                            descriptionAbove: true,
                            descriptionClassName: "county-field-ranges",
                            formItemClassName:
                              "county-field-ranges [&_.slot-form-message]:w-max",
                            props: {
                              appendText: "Add range",
                            },
                            fields: [
                              {
                                rhf: "Select",
                                label: "From age",
                                labelClassName: "text-black font-bold",
                                name: "from-age",
                                formItemClassName: "w-[125px]",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: ageOptions,
                                },
                                addtnlRules: [
                                  {
                                    type: "toGreaterThanFrom",
                                    fieldName: "county-field-ranges",
                                    fromField: "from-age",
                                    toField: "to-age",
                                    message:
                                      "To age must be greater than From age",
                                  },
                                ],
                              },
                              {
                                rhf: "Select",
                                label: "To age",
                                labelClassName: "text-black font-bold",
                                name: "to-age",
                                formItemClassName: "w-[125px]",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: ageOptions,
                                },
                              },
                              {
                                rhf: "Input",
                                label: "Above",
                                labelClassName: "text-black font-bold",
                                name: "above",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                },
                                formItemClassName: "w-[159px]",
                                props: {
                                  icon: "% FPL",
                                  iconRight: true,
                                },
                              },
                              {
                                rhf: "Input",
                                label: "Up to and including",
                                labelClassName: "text-black font-bold",
                                name: "up-to-and-including",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                },
                                formItemClassName: "w-[159px]",
                                props: {
                                  icon: "% FPL",
                                  iconRight: true,
                                },
                              },
                            ],
                          },
                          {
                            rhf: "WrappedGroup",
                            name: "county-overlap-group",
                            props: {
                              wrapperClassName: "flex flex-col gap-6",
                            },
                            fields: [
                              {
                                rhf: "Select",
                                label: "Do the age ranges overlap?",
                                labelClassName: "text-black font-bold",
                                name: "county-age-ranges-overlap",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: [
                                    { value: "yes", label: "Yes" },
                                    { value: "no", label: "No" },
                                  ],
                                  className: "w-[125px]",
                                },
                              },
                              {
                                rhf: "Textarea",
                                label:
                                  "Explain, including the age ranges for each income standard that has overlapping ages and the reason for having different income standards.",
                                labelClassName: "text-black font-bold",
                                name: "county-overlap-explanation",
                                props: {
                                  className: "min-h-[114px]",
                                },
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: noLeadingTrailingWhitespace,
                                    message:
                                      "Must not have leading or trailing whitespace.",
                                  },
                                },
                                formItemClassName:
                                  "ml-[0.6rem] px-4 border-l-4 border-l-primary",
                                dependency: {
                                  conditions: [
                                    {
                                      name: "county-age-ranges-overlap",
                                      type: "expectedValue",
                                      expectedValue: "yes",
                                    },
                                  ],
                                  effect: {
                                    type: "show",
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
                    label: "By city",
                    value: "by-city",
                    slots: [
                      {
                        rhf: "TextDisplay",
                        name: "city-description",
                        formItemClassName: "pb-6 border-b-2",
                        text: [
                          {
                            text: "Enter one city if the city has a unique income standard. If multiple cities share the same income standard, enter all the cities, then enter the income standard that applies to those cities.",
                          },
                        ],
                      },
                      {
                        rhf: "FieldArray",
                        name: "cs7_income-standard-exceptions_cities",
                        props: {
                          ...DefaultFieldGroupProps,
                          appendText: "Add city",
                          removeText: "Remove",
                        },
                        fields: [
                          {
                            rhf: "Input",
                            label: "City",
                            labelClassName: "text-black font-bold",
                            props: {
                              className: "w-[527px]",
                            },
                            name: "city-name",
                            rules: {
                              required: "* Required",
                            },
                          },
                          {
                            rhf: "FieldArray",
                            name: "city-field-ranges",
                            description:
                              "Begin with the youngest age range first. The lower limit for CHIP eligibility should be the highest standard used for Medicaid children for the same age group(s) entered here.",
                            descriptionAbove: true,
                            descriptionClassName: "city-field-ranges",
                            formItemClassName:
                              "city-field-ranges [&_.slot-form-message]:w-max",
                            props: {
                              appendText: "Add range",
                            },
                            fields: [
                              {
                                rhf: "Select",
                                label: "From age",
                                labelClassName: "text-black font-bold",
                                name: "from-age",
                                formItemClassName: "w-[125px]",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: ageOptions,
                                },
                                addtnlRules: [
                                  {
                                    type: "toGreaterThanFrom",
                                    fieldName: "city-field-ranges",
                                    fromField: "from-age",
                                    toField: "to-age",
                                    message:
                                      "To age must be greater than From age",
                                  },
                                ],
                              },
                              {
                                rhf: "Select",
                                label: "To age",
                                labelClassName: "text-black font-bold",
                                name: "to-age",
                                formItemClassName: "w-[125px]",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: ageOptions,
                                },
                              },
                              {
                                rhf: "Input",
                                label: "Above",
                                labelClassName: "text-black font-bold",
                                name: "above",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                },
                                formItemClassName: "w-[159px]",
                                props: {
                                  icon: "% FPL",
                                  iconRight: true,
                                },
                              },
                              {
                                rhf: "Input",
                                label: "Up to and including",
                                labelClassName: "text-black font-bold",
                                name: "up-to-and-including",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                },
                                formItemClassName: "w-[159px]",
                                props: {
                                  icon: "% FPL",
                                  iconRight: true,
                                },
                              },
                            ],
                          },
                          {
                            rhf: "WrappedGroup",
                            name: "city-overlap-group",
                            props: {
                              wrapperClassName: "flex flex-col gap-6",
                            },
                            fields: [
                              {
                                rhf: "Select",
                                label: "Do the age ranges overlap?",
                                labelClassName: "text-black font-bold",
                                name: "city-age-ranges-overlap",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: [
                                    { value: "yes", label: "Yes" },
                                    { value: "no", label: "No" },
                                  ],
                                  className: "w-[125px]",
                                },
                              },
                              {
                                rhf: "Textarea",
                                label:
                                  "Explain, including the age ranges for each income standard that has overlapping ages and the reason for having different income standards.",
                                labelClassName: "text-black font-bold",
                                name: "city-overlap-explanation",
                                props: {
                                  className: "",
                                },
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: noLeadingTrailingWhitespace,
                                    message:
                                      "Must not have leading or trailing whitespace.",
                                  },
                                },
                                formItemClassName:
                                  "ml-[0.6rem] px-4 border-l-4 border-l-primary",
                                dependency: {
                                  conditions: [
                                    {
                                      name: "city-age-ranges-overlap",
                                      type: "expectedValue",
                                      expectedValue: "yes",
                                    },
                                  ],
                                  effect: {
                                    type: "show",
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
                    label: "Other geographic area",
                    value: "other-geographic-area",
                    slots: [
                      {
                        rhf: "TextDisplay",
                        name: "cs7_income-standard-exceptions_other",
                        formItemClassName: "pb-6 border-b-2",
                        text: [
                          {
                            text: "Enter each geographic area with a unique income standard.",
                          },
                        ],
                      },
                      {
                        rhf: "FieldArray",
                        name: "other-geo",
                        props: {
                          ...DefaultFieldGroupProps,
                          appendText: "Add city",
                          removeText: "Remove",
                        },
                        fields: [
                          {
                            rhf: "Input",
                            label: "Geographic area",
                            labelClassName: "text-black font-bold",
                            props: {
                              className: "w-[527px]",
                            },
                            name: "other-name",
                            rules: {
                              required: "* Required",
                            },
                          },
                          {
                            rhf: "FieldArray",
                            name: "other-field-ranges",
                            description:
                              "Begin with the youngest age range first. The lower limit for CHIP eligibility should be the highest standard used for Medicaid children for the same age group(s) entered here.",
                            descriptionAbove: true,
                            descriptionClassName: "other-field-ranges",
                            formItemClassName:
                              "other-field-ranges [&_.slot-form-message]:w-max",
                            props: {
                              appendText: "Add range",
                            },
                            fields: [
                              {
                                rhf: "Select",
                                label: "From age",
                                labelClassName: "text-black font-bold",
                                name: "from-age",
                                formItemClassName: "w-[125px]",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: ageOptions,
                                },
                                addtnlRules: [
                                  {
                                    type: "toGreaterThanFrom",
                                    fieldName: "other-field-ranges",
                                    fromField: "from-age",
                                    toField: "to-age",
                                    message:
                                      "To age must be greater than From age",
                                  },
                                ],
                              },
                              {
                                rhf: "Select",
                                label: "To age",
                                labelClassName: "text-black font-bold",
                                name: "to-age",
                                formItemClassName: "w-[125px]",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: ageOptions,
                                },
                              },
                              {
                                rhf: "Input",
                                label: "Above",
                                labelClassName: "text-black font-bold",
                                name: "above",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                },
                                formItemClassName: "w-[159px]",
                                props: {
                                  icon: "% FPL",
                                  iconRight: true,
                                },
                              },
                              {
                                rhf: "Input",
                                label: "Up to and including",
                                labelClassName: "text-black font-bold",
                                name: "up-to-and-including",
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: /^[0-9]\d*$/,
                                    message: "Must be a positive integer value",
                                  },
                                },
                                formItemClassName: "w-[159px]",
                                props: {
                                  icon: "% FPL",
                                  iconRight: true,
                                },
                              },
                            ],
                          },
                          {
                            rhf: "WrappedGroup",
                            name: "other-overlap-group",
                            props: {
                              wrapperClassName: "flex flex-col gap-6",
                            },
                            fields: [
                              {
                                rhf: "Select",
                                label: "Do the age ranges overlap?",
                                labelClassName: "text-black font-bold",
                                name: "other-age-ranges-overlap",
                                rules: {
                                  required: "* Required",
                                },
                                props: {
                                  options: [
                                    { value: "yes", label: "Yes" },
                                    { value: "no", label: "No" },
                                  ],
                                  className: "w-[125px]",
                                },
                              },
                              {
                                rhf: "Textarea",
                                label:
                                  "Explain, including the age ranges for each income standard that has overlapping ages and the reason for having different income standards.",
                                labelClassName: "text-black font-bold",
                                name: "other-overlap-explanation",
                                props: {
                                  className: "min-h-[114px]",
                                },
                                rules: {
                                  required: "* Required",
                                  pattern: {
                                    value: noLeadingTrailingWhitespace,
                                    message:
                                      "Must not have leading or trailing whitespace.",
                                  },
                                },
                                formItemClassName:
                                  "ml-[0.6rem] px-4 border-l-4 border-l-primary",
                                dependency: {
                                  conditions: [
                                    {
                                      name: "other-age-ranges-overlap",
                                      type: "expectedValue",
                                      expectedValue: "yes",
                                    },
                                  ],
                                  effect: {
                                    type: "show",
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
            },
          ],
        },
      ],
    },
    {
      title: "Special program for children with disabilities",
      sectionId: "special-program-for-children-with-disabilities",
      subsection: true,
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Does the state have a special program for children with disabilities?",
              labelClassName: "text-black font-bold",
              name: "special-program-for-children-with-disabilities",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ],
                className: "w-[125px]",
              },
            },
            {
              rhf: "Select",
              label:
                "Is the program available to all eligible targeted low-income children?",
              labelClassName: "text-black font-bold",
              name: "program-available-to-all-eligible-targeted-low-income-children",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ],
                className: "w-[125px]",
              },
            },
            {
              rhf: "Checkbox",
              label: "Is the program limited by age or income level?",
              labelClassName: "text-black font-bold",
              name: "program-limited-by-age-or-income-level",
              rules: {
                required: "* Required",
              },
              formItemClassName:
                "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",

              dependency: {
                conditions: [
                  {
                    name: "cs7_special-program-for-children-with-disabilities_program-available-to-all-eligible-targeted-low-income-children",
                    type: "expectedValue",
                    expectedValue: "no",
                  },
                ],
                effect: {
                  type: "show",
                },
              },
              props: {
                options: [
                  {
                    label: "The program is limited to certain age groups.",
                    value: "limited-to-certain-age-groups",
                    slots: [
                      {
                        rhf: "Select",
                        label: "Lower age limit",
                        labelClassName: "text-black font-bold",
                        name: "lower-age-limit",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          options: ageOptions,
                          className: "w-[125px]",
                        },
                      },
                      {
                        rhf: "Select",
                        label: "Upper age limit",
                        labelClassName: "text-black font-bold",
                        name: "upper-age-limit",
                        rules: {
                          required: "* Required",
                        },
                        props: {
                          options: ageOptions,
                          className: "w-[125px]",
                        },
                      },
                    ],
                  },
                  {
                    label:
                      "The program is limited to targeted low-income children under a certain income level.",
                    value:
                      "limited-to-targeted-low-income-children-under-certain-income-level",
                    slots: [
                      {
                        rhf: "Input",
                        label: "Income level up to",
                        labelClassName: "text-black font-bold",
                        name: "income-level-up-to",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^[0-9]\d*$/,
                            message: "Must be a positive integer value",
                          },
                        },
                        formItemClassName: "w-[159px]",
                        props: {
                          icon: "% FPL",
                          iconRight: true,
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              label: "Describe the disability criteria used.",
              labelClassName: "text-black font-bold",
              name: "describe-the-disability-criteria-used",
              props: {
                className: "min-h-[114px]",
              },
              rules: {
                required: "* Required",
                pattern: {
                  value: noLeadingTrailingWhitespace,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
            {
              rhf: "Textarea",
              label:
                "Describe the program, including additional benefits offered.",
              labelClassName: "text-black font-bold",
              name: "describe-the-program",
              props: {
                className: "min-h-[114px]",
              },
              rules: {
                required: "* Required",
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
};
