import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header:
    "ABP 2a: Voluntary benefit package selection assurances - Eligibility group under Section 1902(a)(10)(A)(i)(VIII) of the Act ",
  formId: "abp2a",
  sections: [
    {
      title: "Benefit alignment and requirements",
      sectionId: "benefit-align-and-require",
      form: [
        {
          slots: [
            {
              rhf: "Select",
              name: "is-state-territory-aligned",
              descriptionClassName: "text-black text-base",
              descriptionAbove: true,
              description: [
                {
                  text: "The state/territory has fully aligned its EHB-defined Alternative Benefit Plan (ABP) benefits with its approved Medicaid state plan.",
                  type: "default",
                  classname: "font-bold block pb-1",
                },
                {
                  text: "Therefore, the state/territory meets the requirements for voluntary choice of benefit package for individuals exempt from mandatory participation in a Section 1937 ABP.",
                  type: "default",
                  classname: "font-bold block pt-4",
                },
              ],
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
              name: "explain-how-state-territory-aligned",
              description:
                "Explain how the state has fully aligned its benefits.",
              descriptionAbove: true,
              descriptionClassName: "font-bold text-black",
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
                    name: "abp2a_benefit-align-and-require_is-state-territory-aligned",
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
      sectionId: "assurances",
      dependency: {
        conditions: [
          {
            name: "abp2a_benefit-align-and-require_is-state-territory-aligned",
            type: "expectedValue",
            expectedValue: "no",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description:
            "These assurances must be made by the state/territory if the ''adult'' eligibility group is included in the ABP population.",
          slots: [
            {
              rhf: "Checkbox",
              name: "adult-eligibility-included",
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
                    styledLabel: [
                      {
                        text: "Once an individual is identified, the state/territory assures it will effectively inform the individual:",
                        type: "default",
                        classname: "block pb-1",
                      },
                      {
                        text: "A. That enrollment in the specified ABP is voluntary",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "B. That the individual may disenroll from the ABP defined subject to Section 1937 requirements at any time and instead receive an ABP defined as the approved state/territory Medicaid state plan not subject to Section 1937 requirements.",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "C. What the process is for transferring to the state plan-based ABP",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
                    value: "individual_identified_must_inform_the_individual",
                  },
                  {
                    styledLabel: [
                      {
                        text: "The state/territory assures it will inform the individual of:",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "A. The benefits available as ABP coverage defined using Section 1937 requirements as compared to ABP coverage defined as the state/territory's approved Medicaid state plan and not subject to Section 1937 requirements",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "B. The costs of the different benefit packages and a comparison of how the ABP subject to Section 1937 requirements differs from the ABP defined as the approved Medicaid state/territory plan benefits",
                        type: "default",
                        classname: "block py-1",
                      },
                    ],
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
      sectionId: "delivery-of-info",
      dependency: {
        conditions: [
          {
            name: "abp2a_benefit-align-and-require_is-state-territory-aligned",
            type: "expectedValue",
            expectedValue: "no",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description:
            "How will the state/territory inform individuals about their options for enrollment?",
          slots: [
            {
              rhf: "Checkbox",
              name: "assurances",
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
                        rhf: "Textarea",
                        name: "describe-other-enrollment",
                        label: "Describe",
                        labelClassName: "font-bold",
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
              rhf: "Upload",
              name: "provide-copy_upload",
              description:
                "Provide a copy of the letter, email, or other communication.",
              descriptionAbove: true,
              descriptionClassName: "font-bold text-black",
              rules: {
                required: "* Required",
              },
              props: { maxFiles: 3 },
            },
            {
              rhf: "Input",
              name: "when-to-inform",
              descriptionAbove: true,
              description:
                "When did/will the state/territory inform the individuals?",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
              descriptionClassName: "font-bold text-black",
            },
            {
              rhf: "Textarea",
              name: "describe-process-in-section1902",
              descriptionAbove: true,
              description:
                "Describe the state/territory's process for allowing individuals in the Section 1902(a)(10)(A)(i)(VIII) eligibility group who meet exemption criteria to disenroll from the ABP using Section 1937 requirements and enroll in the ABP that is the state/territory's approved Medicaid state plan.",
              descriptionClassName: "font-bold text-black",
              rules: {
                required: "* Required",
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: "Must not have leading or trailing whitespace.",
                },
              },
            },
            {
              rhf: "Checkbox",
              name: "state-territory-assures-it-will-document-exempt-individuals",
              formItemClassName: "whitespace-pre-wrap",
              rules: {
                required: "* Required",
              },
              props: {
                options: [
                  {
                    styledLabel: [
                      {
                        text: "The state/territory assures it will document in the exempt individual's eligibility file that the individual:",
                        type: "default",
                        classname: "block pb-1",
                      },
                      {
                        text: "A. Was informed in accordance with this section prior to enrollment",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "B. Was given ample time to arrive at an informed choice",
                        type: "default",
                        classname: "block py-1",
                      },
                      {
                        text: "C. Chose to enroll in ABP coverage subject to Section 1937 requirements or defined as the state/territory's approved Medicaid state plan not subject to Section 1937 requirements",
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
              name: "where-will-info-be-doc",
              descriptionAbove: true,
              descriptionClassName: "font-bold text-black",
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
                        rhf: "Textarea",
                        name: "where-will-info-be-doc-describe-other",
                        label: "Describe",
                        labelClassName: "font-bold",
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
              rhf: "Checkbox",
              name: "what-docu-will-be-maintained",
              descriptionAbove: true,
              descriptionClassName: "font-bold text-black",
              description:
                "What documentation will be maintained in the eligibility file?",
              formItemClassName: "pb-6 border-b-[1px] border-[#AEB0B5]",
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
                        rhf: "Textarea",
                        name: "describe-other-maintained",
                        label: "Describe",
                        labelClassName: "font-bold",
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
              rhf: "Checkbox",
              name: "state-territory-assures-maintain-data",
              rules: {
                required: "* Required",
              },
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
      sectionId: "addtnl-info",
      dependency: {
        conditions: [
          {
            name: "abp2a_benefit-align-and-require_is-state-territory-aligned",
            type: "expectedValue",
            expectedValue: "no",
          },
        ],
        effect: { type: "show" },
      },
      form: [
        {
          description:
            "Other information about benefit package selection assurances for exempt participants (optional)",
          slots: [
            {
              rhf: "Textarea",
              name: "addtnl-desc",
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
