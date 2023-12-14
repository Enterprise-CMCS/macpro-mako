import { FormSchema } from "shared-types";

const ABP3_1: FormSchema = {
  header:
    "ABP 3.1: Selection of benchmark benefit package or benchmark-equivalent benefit package",
  sections: [
    {
      title: "Benefit package details",
      form: [
        {
          description: "Select one of the following",
          slots: [
            {
              rhf: "Radio",
              name: "alternative_benefit_plan_population_name",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state/territory is amending one existing benefit package for the population defined in Section 1.",
                    value: "amending_existing_package",
                  },
                  {
                    label:
                      "The state/territory is amending one existing benefit package for the population defined in Section 1.",
                    value: "creating_new_package",
                  },
                ],
              },
            },
          ],
        },
        {
          description: "Benefit package name",
          slots: [
            {
              rhf: "Input",
              name: "benefit_package_name",
              label: "Benefit package name",
              rules: {
                required: "* Required",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Additional information",
      form: [
        {
          description:
            "Other information related to selection of the Section 1937 coverage option and the EHB-benchmark plan (optional)",
          slots: [
            {
              name: "additional_information",
              rhf: "Textarea",
            },
          ],
        },
      ],
    },
  ],
};

export const form = ABP3_1;
