import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 10: General assurances",
  formId: "abp10",
  sections: [
    {
      title: "Economy and efficiency of plans",
      sectionId: "economy-and-efficiency-of-plans",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "assures-abp-coverage-in-accordance",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The state or territory assures that Alternative Benefit Plan coverage is provided in accordance with federal upper payment limit requirements and other economy and efficiency principles that would otherwise be applicable to the services or delivery system through which the coverage and benefits are obtained.",
                    value: "assures_alternative_benefit_plan_in_accordance",
                  },
                ],
              },
            },
            {
              rhf: "Select",
              name: "describe-approach",
              label:
                "Will economy and efficiency be achieved using the same approach as used for Medicaid state plan services?",
              labelClassName: "font-bold",
              rules: { required: "* Required" },
              props: {
                className: "w-[150px]",
                options: [
                  { label: "Yes", value: "yes" },
                  {
                    label: "No",
                    value: "no",
                  },
                ],
              },
            },
            {
              rhf: "Textarea",
              label: "Describe the approach",
              labelClassName: "font-bold",
              name: "approach-description",
              formItemClassName:
                "ml-[0.6rem] px-4 my-2 border-l-4 border-l-primary",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              dependency: {
                conditions: [
                  {
                    name: "abp10_economy-and-efficiency-of-plans_describe-approach",
                    type: "expectedValue",
                    expectedValue: "no",
                  },
                ],
                effect: { type: "show" },
              },
            },
          ],
        },
      ],
    },
    {
      title: "Compliance with the law",
      sectionId: "compliance-with-the-law",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "comp-with-law",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The state or territory will continue to comply with all other provisions of the Social Security Act in the administration of the state or territory plan under this title.",
                    value: "comply_with_social_security_act",
                  },
                  {
                    label:
                      "The state or territory assures that Alternative Benefit Plan benefits designs shall conform to the non-discrimination requirements at 42 CFR 430.2 and 42 CFR 440.347(e).",
                    value: "assures_alternative_benefit_plan_shall_conform",
                  },
                  {
                    label:
                      "The state or territory assures that all providers of Alternative Benefit Plan benefits shall meet the provider qualification requirements of the base benchmark plan and/or the Medicaid state plan.",
                    value:
                      "providers_of_alternative_benefit_plan_meets_provider_qualifications",
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
