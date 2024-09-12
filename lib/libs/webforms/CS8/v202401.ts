import { FormSchema } from "shared-types";

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
                  },
                  {
                    label: "No age restriction",
                    value: "no-age-restriction",
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
                              name: "cs8_age_describe-applicant-child-preg-woman",
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
  ],
};
