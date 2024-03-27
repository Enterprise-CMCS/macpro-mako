import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "ABP 2a: Voluntary benefit package selection assurances - Eligibility group under Section 1902(a)(10)(A)(i)(VIII) of the Act ",
  sections: [
    {
      title: "Benefit alignment and requirements",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              name: "abp-2a_benefit-align-and-require_is-state-territory-aligned_select",
              label:
                "The state/territory has fully aligned its EHB-defined Alternative Benefit Plan (ABP) benefits with its approved Medicaid state plan.",
              labelStyling: "font-bold text-[0.8rem]",
              description:
                "Therefore, the state/territory meets the requirements for voluntary choice of benefit package for individuals exempt from mandatory participation in a Section 1937 ABP.",
              descriptionAbove: true,
              descriptionStyling: "font-bold text-black",
              rules: {
                required: "* Required",
              },
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
              name: "abp-2a_benefit-align-and-require_explain-how-state-territory-aligned_textarea",
              description:
                "Explain how the state has fully aligned its benefits.",
              descriptionAbove: true,
              descriptionStyling: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              dependency: {
                conditions: [
                  {
                    name: "abp-2a_benefit-align-and-require_is-state-territory-aligned_select",
                    type: "expectedValue",
                    expectedValue: "yes",
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
      title: "Assurances",
      form: [
        {
          description:
            "These assurances must be made by the state/territory if the ''adult'' eligibility group is included in the ABP population.",
          slots: [
            {
              rhf: "Checkbox",
              name: "abp-2a_assurances_adult-eligibility-included_checkgroup",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label:
                      "The state/territory shall enroll all participants in the “individuals age 19 or older and under age 65 at or below 133% FPL” (Section 1902(a)(10)(A)(i)(VIII)) eligibility group in the ABP specified in this state plan amendment, except as follows: A beneficiary in the eligibility group at Section 1902(a)(10)(A)(i)(VIII) who is determined to meet one of the exemption criteria at 45 CFR 440.315 will receive a choice of a benefit package that is either an ABP that includes essential health benefits and is subject to all Section 1937 requirements or an ABP that is the state/territory’s approved Medicaid state plan not subject to Section 1937 requirements. The state/territory’s approved Medicaid state plan includes all approved state plan programs based on any state plan authority and approved Section 1915(c) waivers, if the state has amended them to include the eligibility group at Section 1902(a)(10)(A)(i)(VIII).",
                    value: "at_or_bellow_133_age_19_through_64",
                  },
                  {
                    label:
                      "The state/territory must have a process in place to identify individuals that meet the exemption criteria, and the state/territory must comply with requirements related to providing the option of enrollment in an ABP defined using Section 1937 requirements or an ABP defined as the state/territory's approved Medicaid state plan not subject to Section 1937 requirements.",
                    value:
                      "state_territory_must_have_a_process_that_meets_exemption_criteria",
                  },
                  {
                    label: "",
                    styledLabel: [
                      {
                        text: "Once an individual is identified, the state/territory assures it will effectively inform the individual of the following:",
                        type: "br",
                      },
                      {
                        text: "A. That enrollment in the specified ABP is voluntary",
                        type: "br",
                      },
                      {
                        text: "B. That the individual may disenroll from the ABP defined subject to Section 1937 requirements at any time and instead receive an ABP defined as the approved state/territory Medicaid state plan not subject to Section 1937 requirements.",
                        type: "br",
                      },
                      {
                        text: "C. What the process is for transferring to the state plan-based ABP",
                        type: "br",
                      },
                    ],
                    value: "individual_identified_must_inform_the_individual",
                  },
                  {
                    styledLabel: [
                      {
                        text: "The state/territory assures it will inform the individual of the following:",
                        type: "br",
                      },
                      {
                        text: "A. The benefits available as ABP coverage defined using Section 1937 requirements as compared to ABP coverage defined as the state/territory's approved Medicaid state plan and not subject to Section 1937 requirements",
                        type: "br",
                      },
                      {
                        text: "B. The costs of the different benefit packages and a comparison of how the ABP subject to Section 1937 requirements differs from the ABP defined as the approved Medicaid state/territory plan benefits",
                        type: "br",
                      },
                    ],
                    label: "  ",
                    value:
                      "state_territory_assures_it_will_inform_the_individual",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Delivery of information",
      form: [
        {
          description:
            "How will the state/territory inform individuals about their options for enrollment?",
          slots: [
            {
              rhf: "Checkbox",
              name: "abp-2a_delivery-of-info_assurances_checkgroup",
              rules: { required: "* Required" },
              props: {
                options: [
                  {
                    label: "Letter",
                    value: "letter",
                  },
                  {
                    label: "Email",
                    value: "email",
                  },
                  {
                    label: "Other",
                    value: "other",
                    slots: [
                      {
                        rhf: "Input",
                        name: "abp-2a_delivery-of-info_describe-other-input",
                        label: "Describe",
                        labelStyling: "font-bold",
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Upload",
              name: "abp-2a_delivery-of-info_provide-copy_upload",
              description:
                "Provide a copy of the letter, email, or other communication.",
              descriptionAbove: true,
              descriptionStyling: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: { maxFiles: 3 },
            },
            {
              rhf: "Input",
              name: "abp-2a_delivery-of-info_when-to-inform_input",
              descriptionAbove: true,
              description:
                "When did/will the state/territory inform the individuals?",
              rules: {
                required: "* Required",
              },
              descriptionStyling: "font-bold text-black",
            },
            {
              rhf: "Textarea",
              name: "abp-2a_delivery-of-info_describe-process-in-section1902_textarea",
              descriptionAbove: true,
              description:
                "Describe the state/territory's process for allowing individuals in the Section 1902(a)(10)(A)(i)(VIII) eligibility group who meet exemption criteria to disenroll from the ABP using Section 1937 requirements and enroll in the ABP that is the state/territory's approved Medicaid state plan.",
              descriptionStyling: "font-bold text-black",
              rules: {
                required: "* Required",
              },
            },
            {
              rhf: "Checkbox",
              name: "abp-2a_delivery-of-info_state-territory-assures-it-will-document-exempt-individuals_checkgroup",
              formItemStyling: "whitespace-pre-wrap",
              props: {
                options: [
                  {
                    label: "",
                    styledLabel: [
                      {
                        text: "The state/territory assures it will document in the exempt individual's eligibility file that the individual:",
                        type: "br",
                      },
                      {
                        text: "A. Was informed in accordance with this section prior to enrollment",
                        type: "br",
                      },
                      {
                        text: "B. Was given ample time to arrive at an informed choice",
                        type: "br",
                      },
                      {
                        text: " C. Chose to enroll in ABP coverage subject to Section 1937 requirements or defined as the state/territory's approved Medicaid state plan not subject to Section 1937 requirements",
                        type: "br",
                      },
                    ],
                    value:
                      "state_territory_will_document_exempt_individuals_eligibility",
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "abp-2a_delivery-of-info_where-will-info-be-doc_checkgroup",
              descriptionAbove: true,
              descriptionStyling: "font-bold text-black",
              description: "Where will the information be documented?",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "In the eligibility system",
                    value: "in_eligibility_system",
                  },
                  {
                    label: "In the hard copy of the case record",
                    value: "hard_copy_of_case_record",
                  },
                  {
                    label: "Other",
                    value: "other",
                    slots: [
                      {
                        rhf: "Input",
                        name: "abp-2a_delivery-of-info_where-will-info-be-doc-describe-other_input",
                        label: "Describe",
                        labelStyling: "font-bold",
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "abp-2a_delivery-of-info_what-docu-will-be-maintained_checkgroup",
              descriptionAbove: true,
              descriptionStyling: "font-bold text-black",
              description:
                "What documentation will be maintained in the eligibility file?",
              formItemStyling: "border-b-4",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    label: "Copy of correspondence sent to the individual",
                    value: "copy_of_correspondence_sent_to_the_individual",
                  },
                  {
                    label:
                      "Signed documentation from the individual consenting to enrollment in the ABP",
                    value:
                      "signed_documentation_from_individual_consenting_enrollment_ABP",
                  },
                  {
                    label: "Other",
                    value:
                      "what_documentation_will_be_maintained_in_the_eligibility_file_other",
                    slots: [
                      {
                        rhf: "Input",
                        name: "abp-2a_delivery-of-info_describe-other_input",
                        label: "Describe",
                        labelStyling: "font-bold",
                        rules: {
                          required: "* Required",
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              rhf: "Checkbox",
              name: "abp-2a_delivery-of-info_state-territory-assures-maintain-data_checkgroup",
              props: {
                options: [
                  {
                    label:
                      "The state/territory assures that it will maintain data that tracks the total number of individuals who have voluntarily enrolled in either ABP coverage subject to Section 1937 requirements or ABP coverage defined as the state/territory's approved Medicaid state plan not subject to Section 1937 requirements.",
                    value: "state_territory_assures_it_will_maintain_data",
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
            "Other information about benefit package selection assurances for exempt participants (optional)",
          slots: [
            {
              rhf: "Textarea",
              name: "abp-2a_additional_information_textarea",
            },
          ],
        },
      ],
    },
  ],
};
