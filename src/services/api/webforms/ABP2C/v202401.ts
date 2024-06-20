import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP 2c: Enrollment assurances - Mandatory participants",
  formId: "abp2c",
  sections: [
    {
      title: "Assurances",
      sectionId: "assurances",
      form: [
        {
          slots: [
            {
              name: "mandatory-identify-exempt",
              rhf: "Checkbox",
              descriptionAbove: true,
              descriptionClassName: "text-black text-base",
              description: [
                "These assurances must be made by the state/territory if enrollment is mandatory for any of the target populations or subpopulations.",
                {
                  type: "br",
                  classname: "font-bold block py-4",
                  text: "When mandatorily enrolling eligibility groups in an Alternative Benefit Plan (ABP) (benchmark or benchmark-equivalent plan) that could have exempt individuals, prior to enrollment:",
                },
              ],
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    value: "assure_individuals_in_egroup_exempt_section_1937",
                    styledLabel: [
                      {
                        text: "The state/territory assures it will appropriately identify any individuals in the eligibility groups who:",
                        classname: "block py-1",
                      },
                      {
                        text: "A. Are exempt from mandatory enrollment in an ABP",
                        classname: "block py-1",
                      },
                      {
                        text: "B. Meet the exemption criteria and are given a choice of ABP coverage defined using Section 1937 requirements or ABP coverage defined as the state/territory’s approved Medicaid state plan not subject to Section 1937 requirements",
                        classname: "block py-1",
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "how-identify",
              rhf: "Checkbox",
              label: "How will the state/territory identify these individuals?",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "Review of eligibility criteria (e.g., age, disorder, diagnosis, condition)",
                    value: "review_of_eligibility_criteria",
                    slots: [
                      {
                        name: "how-id-review-eligible-crit-desc",
                        rhf: "Textarea",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^\S(.*\S)?$/,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                  {
                    label: "Self-identification",
                    value: "self_identification",
                    slots: [
                      {
                        name: "how-id-self-id-desc",
                        rhf: "Textarea",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^\S(.*\S)?$/,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                  {
                    label: "Other",
                    value: "other",
                    slots: [
                      {
                        name: "how-id-other-desc",
                        rhf: "Textarea",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^\S(.*\S)?$/,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
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
      title: "Exemptions",
      sectionId: "exemptions",
      form: [
        {
          slots: [
            {
              name: "mandatory-inform-current-exempt",
              rhf: "Checkbox",
              rules: { required: "* Required" },
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
              name: "madatory-inform-future-exempt",
              rhf: "Checkbox",
              rules: { required: "* Required" },
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
              name: "how-id-become-exempt",
              rhf: "Checkbox",
              label:
                "How will the state/territory identify if an individual becomes exempt?",
              labelClassName: "font-bold text-black",
              rules: { required: "* Required" },
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
                        name: "how-id-exempt-other-desc",
                        rhf: "Textarea",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^\S(.*\S)?$/,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "freq-determine-exemptions",
              rhf: "Radio",
              rules: { required: "* Required" },
              labelClassName: "font-bold text-black",
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
                        name: "freq-determine-ex-other-desc",
                        rhf: "Textarea",
                        label: "Describe",
                        labelClassName: "font-bold text-black",
                        rules: {
                          required: "* Required",
                          pattern: {
                            value: /^\S(.*\S)?$/,
                            message:
                              "Must not have leading or trailing whitespace.",
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              name: "assure-disenroll-process",
              rhf: "Checkbox",
              rules: { required: "* Required" },
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
              name: "desc-disenroll-process",
              rhf: "Textarea",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              label: "Describe the process for processing requests.",
              labelClassName: "font-bold text-black",
            },
          ],
        },
      ],
    },
    {
      title: "Additional Information",
      sectionId: "addtnl-info",
      form: [
        {
          slots: [
            {
              name: "description",
              rhf: "Textarea",
              label:
                "Other information about enrollment assurances for mandatory participants (optional)",
              labelClassName: "font-bold text-black",
              props: {
                className: "min-h-[114px]",
              },
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
