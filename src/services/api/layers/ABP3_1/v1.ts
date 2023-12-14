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
              name: "amending_benefit",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label:
                      "The state/territory is amending one existing benefit package for the population defined in Section 1.",
                    value: "existing_package",
                  },
                  {
                    label:
                      "The state/territory is amending one existing benefit package for the population defined in Section 1.",
                    value: "new_package",
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
      title: "Selection of Section 1937 coverage option",
      form: [
        {
          description:
            "The state/territory selects as its Section 1937 coverage option the following type of benchmark bsenefit package or benchmark-equivalent benefit package under this Alternative Benefit Plan:",
          slots: [
            {
              name: "benchmark",
              rhf: "Radio",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "Benchmark benefit package",
                    value: "benefit_package",
                  },
                  {
                    label: "Benchmark-equivalent benefit package",
                    value: "equivalent",
                  },
                ],
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
