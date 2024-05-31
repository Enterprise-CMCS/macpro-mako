import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 9: Employer-sponsored insurance and payment of premiums",
  sections: [
    {
      title: "Employer-sponsored insurance and payment of premiums",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              name: "abp9_employee-sponsored-insur-or-pay_does-state-territory-provided-abp-through-employer-sponsored-insur_select",
              label:
                "Does the state/territory provide the Alternative Benefit Plan (ABP) through the payment of employer-sponsored insurance for participants with such coverage with additional benefits and services provided through a benchmark or benchmark-equivalent benefit package?",
              labelClassName: "font-bold",
              rules: { required: "* Required" },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "Textarea",
              name: "abp9_employee-sponsored-insurance-or-payment_describe-employee-sponsored-insurance_textarea",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              formItemClassName:
                "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              label:
                "Describe the employer-sponsored insurance, including the population covered, amount of premium assistance by population, and employer-sponsored insurance activities, including required contribution, cost-effectiveness test requirements, and benefit information.",
              labelClassName: "font-bold",
              dependency: {
                conditions: [
                  {
                    name: "abp9_employee-sponsored-insur-or-pay_does-state-territory-provided-abp-through-employer-sponsored-insur_select",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
            },

            {
              rhf: "Select",
              name: "abp9_employee-sponsored-insurance-or-pay_does-provide-pay-of-premiums_select",
              label:
                "Does the state/territory otherwise provide for payment of premiums?",
              labelClassName: "font-bold",
              rules: { required: "* Required" },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              rhf: "Textarea",
              name: "abp9_employee-sponsored-insurance-or-pay_describe-include-pop-covered-assist-contribut_textarea",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              formItemClassName:
                "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              label:
                "Describe, including the population covered, amount of premium assistance by population, required contributions, cost-effectiveness test requirements, and benefit information.",
              labelClassName: "font-bold",
              dependency: {
                conditions: [
                  {
                    name: "abp9_employee-sponsored-insurance-or-pay_does-provide-pay-of-premiums_select",
                    type: "expectedValue",
                    expectedValue: "yes",
                  },
                ],
                effect: { type: "show" },
              },
            },

            {
              rhf: "Textarea",
              name: "abp9_employee-sponsored-insurance-or-payment_other-info_textarea",
              label:
                "Other information about employer-sponsored insurance or payment of premiums (optional)",
              labelClassName: "font-bold",
              rules: {
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
