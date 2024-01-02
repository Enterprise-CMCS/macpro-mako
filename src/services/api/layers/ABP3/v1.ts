import { FormSchema } from "shared-types";

const ABP3: FormSchema = {
  header:
    "APB 3: Selection of benchmark benefit package or benchmark-equivalent benefit package",
  sections: [
    {
      title: "Benefit package details",
      form: [
        {
          description: "Select one of the following",
          slots: [
            {
              rhf: "Radio",
              name: "benefit_package_details",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The state/territory is amending one existing benefit package for the population defined in section 1.",
                    value: "benchmark_amending",
                  },
                  {
                    label:
                      "The state/territory is creating a single new benefit package for the population defined in section 1.",
                    value: "benchmark_creating",
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

export const form = ABP3;
