import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "CS 7: Separate CHIP eligibility—Targeted low-income children",
  subheader: "2102(b)(1)(B)(v) of the Social Security Act and 42 CFR 457.310, 457.315, and 457.320",
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
                { text: " are uninsured children under age 19 whose household income is within standards established by the state." },
              ]
            }
          ]
        }
      ]
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
              text: [
                { text: "Must be under age 19.", type: "bold" },
              ]
            }
          ]
        }
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
              rules: {
                required: "* Required"
              },
              props: {
                options: [
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ],
                className: "w-[125px]",
              }
            }
          ]
        }
      ],
    }
  ],
};