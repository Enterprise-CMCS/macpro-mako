import { FormSchema } from "shared-types";

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
            },
          ],
        },
      ],
    },
  ],
};
