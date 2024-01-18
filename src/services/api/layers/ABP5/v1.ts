import { FormSchema } from "shared-types";

const ABP5: FormSchema = {
  header: "ABP 5: Benefits description",
  sections: [
    {
      title: "State plan alignment",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Does this description of benefits align with the traditional state plan?",
              name: "benefits_align_with_traditional_state_plan",
              rules: { required: "Required" },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Description of benefits",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              label:
                "Does the state/territory propose a benchmark-equivalent benefit package?",
              name: "benchmark_equivalent_benefit_package",
              rules: { required: "Required" },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Benefits included in Alternative Benefit Plan",
      form: [
        {
          slots: [
            {
              rhf: "Input",
              label:
                "Enter the specific name of the base benchmark plan selected.",
              name: "base_benchmark_plan_name",
              rules: { required: "Required" },
            },
            {
              rhf: "Input",
              label:
                "Enter the specific name of the Section 1937 coverage option selected, if other than Secretary-approved. Otherwise, enter “Secretary-approved.”",
              name: "section_1937_coverage_option_name",
            },
          ],
        },
      ],
    },
  ],
};

export const form = ABP5;
