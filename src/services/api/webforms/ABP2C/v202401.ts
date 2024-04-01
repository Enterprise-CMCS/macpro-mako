import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 2c: Enrollment Assurances - Mandatory participants",
  sections: [
    {
      title: "Assurances",
      form: [
        {
          description:
            "These assurances must be made by the state/territory if enrollment is mandatory for any of the target populations or subpopulations.",
          slots: [
            {
              name: "abp2c_assurances_mandatory-identify-exempt_checkgroup",
              rhf: "Checkbox",
              label:
                "When mandatorily enrolling eligibility groups in an Alternative Benefit Plan (ABP) (benchmark or benchmark-equivalent plan) that could have exempt individuals, prior to enrollment:",
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures it will appropriately identify any individuals in the eligibility groups who:",
                    value: "assure_individuals_in_egroup_exempt_section_1937",
                    styledLabel: [
                      {
                        text: "The state/territory assures it will appropriately identify any individuals in the eligibility groups who:",
                      },
                      {
                        text: "A. Are exempt from mandatory enrollment in an ABP",
                      },
                      {
                        text: "B. Meet the exemption criteria and are given a choice of ABP coverage defined using Section 1937 requirements or ABP coverage defined as the state/territory’s approved Medicaid state plan not subject to Section 1937 requirements",
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "abp2c_assurances_how-identify_checkgroup",
              rhf: "Checkbox",
              label: "How will the state/territory identify these individuals?",
              props: {
                options: [
                  {
                    label:
                      "Review of eligibility criteria (e.g., age, disorder, diagnosis, condition)",
                    value: "review_of_eligibility_criteria",
                    slots: [
                      {
                        name: "abp2c_assurances_how-id-review-eligible-crit-desc_textarea",
                        rhf: "Textarea",
                        label: "Describe",
                      },
                    ],
                  },
                  {
                    label: "Self-identification",
                    value: "self_identification",
                    slots: [
                      {
                        name: "abp2c_assurances_how-id-self-id-desc_textarea",
                        rhf: "Textarea",
                        label: "Describe",
                      },
                    ],
                  },
                  {
                    label: "Other",
                    value: "other",
                    slots: [
                      {
                        name: "abp2c_assurances_how-id-other-desc_textarea",
                        rhf: "Textarea",
                        label: "Describe",
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
      title: "Exemptions",
      form: [
        {
          slots: [
            {
              name: "abp2c_exemptions_mandatory-inform-current-exempt_checkgroup",
              rhf: "Checkbox",
              props: {
                options: [
                  {
                    label:
                      "The state/territory must inform the individual they are exempt or meet the exemption criteria, and the state/territory must comply with all requirements related to voluntary enrollment or, for beneficiaries in the “individuals age 19 or older and under age 65 at or below 133% FPL” eligibility group, optional enrollment in ABP coverage defined using Section 1937 requirements or ABP coverage defined as the state/territory's approved Medicaid state plan.",
                    value:
                      "state_must_inform_current_exemptions_comply_volunteer_enroll_between_19_and_65_or_133_FPL_optional_enroll_coverage_section_1937",
                  },
                ],
              },
            },
            {
              name: "abp2c_exemptions_madatory-inform-future-exempt_checkgroup",
              rhf: "Checkbox",
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that for individuals who have become exempt from enrollment in an ABP, the state/territory must inform them they are now exempt. The state/territory must comply with all requirements related to voluntary enrollment or, for beneficiaries in the “individuals age 19 or older and under age 65 at or below 133% FPL” eligibility group, optional enrollment in ABP coverage defined using Section 1937 requirements or ABP coverage defined as the state/territory's approved Medicaid state plan.",
                    value:
                      "state_assures_individuals_future_exempt_informedcomply_volunteer_enroll_between_19_and_65_or_133_FPL_optional_enroll_coverage_section_1937",
                  },
                ],
              },
            },
            {
              name: "abp2c_exemptions_how-id-become-exempt_checkgroup",
              rhf: "Checkbox",
              label:
                "How will the state/territory identify if an individual becomes exempt?",
              props: {
                options: [
                  {
                    label: "Review of claims data",
                    value: "review_of_claims_data",
                  },
                  {
                    label: "Self-identification",
                    value: "self_identification",
                  },
                  {
                    label: "Review at the time of eligibility redetermination",
                    value: "review_eligibility_redetermination",
                  },
                  {
                    label: "Provider identification",
                    value: "provider_identification",
                  },
                  {
                    label: "Change in eligibility group",
                    value: "change_in_eligibility_group",
                  },
                  {
                    label: "Other",
                    value: "other",
                    slots: [
                      {
                        name: "abp2c_exemptions_how-id-exempt-other-desc_textarea",
                        rhf: "Textarea",
                        label: "Describe",
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "abp2c_exemptions_freq-determine-exemptions_radiogroup",
              rhf: "Radio",
              label:
                "How frequently will the state/territory review the ABP population to determine if individuals are exempt from mandatory enrollment or meet the exemption criteria?",
              props: {
                options: [
                  {
                    label: "Monthly",
                    value: "monthly",
                  },
                  {
                    label: "Quarterly",
                    value: "quarterly",
                  },
                  {
                    label: "Annually",
                    value: "annually",
                  },
                  {
                    label: "On an as-needed basis",
                    value: "as_needed_basis",
                  },
                  {
                    label: "Other",
                    value: "other",
                    slots: [
                      {
                        name: "abp2c_exemptions_freq-determine-ex-other-desc_textarea",
                        rhf: "Textarea",
                        label: "Describe",
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "abp2c_exemptions_assure-disenroll-process_checkgroup",
              rhf: "Checkbox",
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that it will promptly process all requests made by exempt individuals for disenrollment from the ABP and has in place a process that ensures exempt individuals have access to all standard state/territory plan services or, for beneficiaries in the “individuals age 19 or older and under age 65 at or below 133% FPL” eligibility group, optional enrollment in ABP coverage defined using Section 1937 requirements or ABP coverage defined as the state/territory's approved Medicaid state plan.",
                    value:
                      "state_assures_prompt_disenrollment_request_process_for_exempt_and_ensure_services_available",
                  },
                ],
              },
            },
            {
              name: "abp2c_exemptions_desc-disenroll-process_textarea",
              rhf: "Textarea",
              label: "Describe the process for processing requests.",
            },
          ],
        },
      ],
    },
    {
      title: "Additional Information",
      form: [
        {
          slots: [
            {
              name: "abp2c_additional_info_description_textarea",
              rhf: "Textarea",
              label:
                "Other information about enrollment assurances for mandatory participants (optional)",
            },
          ],
        },
      ],
    },
  ],
};
