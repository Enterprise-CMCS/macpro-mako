import { DefaultFieldGroupProps, FormSchema, RHFSlotProps } from "shared-types";
import { noLeadingTrailingWhitespace } from "shared-utils";

const ageOptions = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
  { value: "13", label: "13" },
  { value: "14", label: "14" },
  { value: "15", label: "15" },
  { value: "16", label: "16" },
  { value: "17", label: "17" },
  { value: "18", label: "18" },
  { value: "19", label: "19" },
];

const childStyle = " ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary ";

const ageRangeGroup = (nameMod: string, fullMod: string, wrapperDep = true): RHFSlotProps[] => [
  {
    name: nameMod + "inc-age-standard",
    descriptionAbove: true,
    description:
      "Begin with the youngest age range first. The upper end of the income range cannot be more than the highest income level for targeted low-income children of the same age.",
    rhf: "FieldArray",
    props: {
      appendText: "Add range",
    },
    addtnlRules: [
      {
        type: "noGapsOrOverlaps",
        fieldName: nameMod + "inc-age-standard",
        fromField: "from-age",
        toField: "to-age",
        options: ageOptions,
      },
    ],
    fields: [
      {
        rhf: "Select",
        name: "from-age",
        labelClassName: "text-black font-bold",
        label: "From age",
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
            fieldName: nameMod + "inc-age-standard",
            fromField: "from-age",
            toField: "to-age",
            message: "To age must be greater than From age",
          },
        ],
      },
      {
        rhf: "Select",
        name: "to-age",
        labelClassName: "text-black font-bold",
        label: "To age",
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
        name: "above",
        labelClassName: "text-black font-bold",
        label: "Above",
        formItemClassName: "w-[159px]",
        props: {
          icon: "% FPL",
          iconRight: true,
        },
        rules: {
          pattern: {
            value: /^[0-9]\d*$/,
            message: "Must be a positive integer value",
          },
          required: "* Required",
        },
      },
      {
        rhf: "Input",
        name: "up-to-and-including",
        labelClassName: "text-black font-bold",
        label: "Up to and including",
        formItemClassName: "w-[159px]",
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
        },
      },
    ],
  },
  {
    name: nameMod + "overlap",
    rhf: "Select",
    props: {
      className: "w-[125px]",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
    },
    rules: { required: "* Required" },
    label: "Do the age ranges overlap?",
    labelClassName: "font-bold text-black",
  },
  {
    name: nameMod + "overlap-desc",
    rhf: "Textarea",
    label:
      "Explain, including the age ranges for each income standard that has overlapping ages and the reason for having different income standards.",
    labelClassName: "font-bold text-black",
    dependency: wrapperDep
      ? {
          conditions: [
            {
              type: "expectedValue",
              expectedValue: "yes",
              name: fullMod + "_" + nameMod + "overlap",
            },
          ],
          effect: { type: "show" },
        }
      : undefined,
    rules: {
      required: "* Required",
      pattern: {
        value: noLeadingTrailingWhitespace,
        message: "Must not have leading or trailing whitespace.",
      },
    },
    props: {
      className: "h-[114px]",
    },
    formItemClassName: childStyle,
  },
];

export const v202401: FormSchema = {
  formId: "cs12",
  header: "CS 12: Separate CHIP eligibility—Dental-only supplemental coverage",
  subheader: "Section 2110(b)(5) of the Social Security Act (SSA)",
  sections: [
    {
      sectionId: "overview",
      title: "Overview",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assurance",
              label: [
                {
                  text: "Dental-only supplemental coverage",
                  classname: "font-bold text-black",
                },
                {
                  text: " for targeted low-income children who are otherwise eligible for CHIP except for the fact they are enrolled in a group health plan or health insurance offered through an employer",
                  classname: "text-black",
                },
              ],
              props: {
                options: [
                  {
                    value: "yes",
                    label:
                      "The state operates this covered group in accordance with the following provisions.",
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
      sectionId: "income",
      title: "Income Standards",
      form: [
        {
          slots: [
            {
              name: "same-standard",
              rhf: "Select",
              label:
                "Does the state use the same income standards for dental-only supplemental coverage as for other targeted low-income children?",
              labelClassName: "font-bold text-black",
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
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
      sectionId: "standards",
      subsection: true,
      title: "Statewide income standards",
      dependency: {
        conditions: [
          {
            expectedValue: "no",
            type: "expectedValue",
            name: "cs12_income_same-standard",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          slots: [
            {
              name: "statewide",
              rhf: "Select",
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              rules: { required: "* Required" },
              labelClassName: "text-black font-bold",
              label: "Are income standards applied statewide?",
            },
            {
              name: "stand-label",
              rhf: "TextDisplay",
              text: [{ type: "bold", text: "Statewide income standards" }],
            },
            ...ageRangeGroup("standard", "cs12_standards"),
          ],
        },
      ],
    },
    {
      sectionId: "inc-exception",
      subsection: true,
      title: "Income standard exceptions",
      dependency: {
        conditions: [
          {
            expectedValue: "no",
            type: "expectedValue",
            name: "cs12_income_same-standard",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          slots: [
            {
              name: "exceptions",
              rhf: "Select",
              props: {
                className: "w-[125px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              rules: { required: "* Required" },
              label:
                "Are there any income standard exceptions, such as populations in a county that may qualify under either a statewide income standard or a county income standard?",
              labelClassName: "font-bold text-black",
            },
            {
              name: "exceptions-desc",
              rhf: "Textarea",
              label:
                "Explain, including a description of the overlapping geographic area and the reason for having different income standards.",
              labelClassName: "font-bold text-black",
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
                    type: "expectedValue",
                    expectedValue: "yes",
                    name: "cs12_inc-exception_exceptions",
                  },
                ],
                effect: { type: "show" },
              },
              formItemClassName: childStyle,
              props: {
                className: "h-[114px]",
              },
            },
            {
              name: "geo-variation",
              rhf: "Checkbox",
              label: "Method of geographic variation",
              labelClassName: "font-bold text-black",
              props: {
                options: [
                  {
                    label: "By county",
                    value: "county",
                    slots: [
                      {
                        name: "county-group",
                        rhf: "FieldArray",
                        description:
                          "Enter one county if the county has a unique income standard. If multiple counties share the same income standard, enter all the counties, then enter the income standard that applies to those counties.",
                        descriptionAbove: true,
                        props: {
                          ...DefaultFieldGroupProps,
                          appendText: "Add county",
                          removeText: "Remove",
                        },
                        fields: [
                          {
                            name: "county-label",
                            rhf: "Input",
                            label: "County",
                            formItemClassName: "w-[520px]",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                          },
                          ...ageRangeGroup("county", "cs12_inc-exception", false),
                        ],
                      },
                    ],
                  },
                  {
                    label: "By city",
                    value: "city",
                    slots: [
                      {
                        name: "city-group",
                        rhf: "FieldArray",
                        description:
                          "Enter one city if the city has a unique income standard. If multiple cities share the same income standard, enter all the cities, then enter the income standard that applies to those cities.",
                        descriptionAbove: true,
                        props: {
                          ...DefaultFieldGroupProps,
                          appendText: "Add city",
                          removeText: "Remove",
                        },
                        fields: [
                          {
                            name: "city-label",
                            rhf: "Input",
                            formItemClassName: "w-[520px]",
                            label: "City",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                          },
                          ...ageRangeGroup("city", "cs12_inc-exception", false),
                        ],
                      },
                    ],
                  },
                  {
                    label: "Other geographic area",
                    value: "geo-area",
                    slots: [
                      {
                        name: "geo-group",
                        rhf: "FieldArray",
                        description: "Enter each geographic area with a unique income standard.",
                        descriptionAbove: true,
                        props: {
                          ...DefaultFieldGroupProps,
                          appendText: "Add geographic area",
                          removeText: "Remove",
                        },
                        fields: [
                          {
                            name: "geo-label",
                            rhf: "Input",
                            formItemClassName: "w-[520px]",
                            label: "Geographic area",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                          },
                          {
                            name: "geo-desc",
                            rhf: "Textarea",
                            label: "Describe",
                            labelClassName: "font-bold text-black",
                            rules: {
                              required: "* Required",
                              pattern: {
                                value: noLeadingTrailingWhitespace,
                                message: "Must not have leading or trailing whitespace.",
                              },
                            },
                            props: {
                              className: "h-[114px]",
                            },
                          },
                          ...ageRangeGroup("geo", "cs12_inc-exception", false),
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
      sectionId: "assurances",
      subsection: true,
      title: "Assurances",
      dependency: {
        conditions: [
          {
            expectedValue: "no",
            type: "expectedValue",
            name: "cs12_income_same-standard",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "title-21",
              props: {
                options: [
                  {
                    value: "assured",
                    label:
                      "The state provides assurance that it has the highest income eligibility standard permitted under Title XXI (or a waiver) as of January 1, 2009, in order to be able to provide dental-only supplemental coverage.",
                  },
                ],
              },
              rules: {
                required: "* Required",
              },
            },
            {
              rhf: "Checkbox",
              name: "no-app-limit",
              props: {
                options: [
                  {
                    value: "assured",
                    label:
                      "The state provides assurance that it does not limit the acceptance of applications for children or impose any numerical limitation, waiting list, or similar limitation on the eligibility of such children for child health assistance under the state plan.",
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
  ],
};
