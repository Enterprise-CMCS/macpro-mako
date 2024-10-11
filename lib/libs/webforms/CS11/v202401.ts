import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "CS 11: Separate CHIP eligibility—Pregnant women who have access to public employee coverage",
  subheader:
    "Sections 2110(b)(2)(B) and (b)(6) of the Social Security Act (SSA)",
  formId: "CS11",
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
            },
          ],
        },
      ],
    },
  ],
};
