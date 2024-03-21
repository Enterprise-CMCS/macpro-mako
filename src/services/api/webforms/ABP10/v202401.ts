import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 10: General assurances",
  sections: [
    {
      title: "Economy and efficiency of plans",
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "abp10_economy-and-efficiency-of-plans_check",
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
              name: "abp10_economy-and-efficiency-of-plans_describe-approach_select",
              label:
                "Will economy and efficiency be achieved using the same approach as used for Medicaid state plan services?",
              labelStyling: "font-bold",
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
              labelStyling: "font-bold",
              name: "abp10_economy-and-efficiency-of-plans_describe-approach_textarea",
              formItemStyling: "ml-[0.6rem] px-4 border-l-4 border-l-primary",
              rules: { required: "* Required" },
              dependency: {
                conditions: [
                  {
                    name: "abp10_economy-and-efficiency-of-plans_describe-approach_select",
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
      form: [
        {
          slots: [
            {
              rhf: "Checkbox",
              name: "abp10_compliance-with-the-law_check",
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
