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
                  text: "when the mother is not otherwise eligible for Medicaid or CHIP",
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
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label: "The age standard is from conception to end of pregnancy.",
              labelClassName: "text-base",
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
              labelClassName: "text-base font-bold",
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
  ],
};
